import { Op } from 'sequelize';
import { 
    pedidosModelo, 
    detallesPedidoModelo, 
    estadosPedidoModelo,
    productosModelo,
    clientesModelo,
    usuariosModelo,
    facturasModelo
} from '../conexion/conexion.js';

export const getAllPedidos = async (req, res) => {
    try {
        const { estado, fecha_inicio, fecha_fin } = req.query;
        
        const where = {};
        
        if (estado) {
            where.estado_id = estado;
        }
        
        if (fecha_inicio && fecha_fin) {
            where.fecha_pedido = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }
        
        const pedidos = await pedidosModelo.findAll({
            where,
            include: [
                {
                    model: estadosPedidoModelo,
                    as: 'estado'
                },
                {
                    model: clientesModelo,
                    as: 'cliente'
                },
                {
                    model: usuariosModelo,
                    as: 'usuario'
                }
            ],
            order: [['fecha_pedido', 'DESC']]
        });
        
        return res.status(200).json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener los pedidos",
            details: error.message 
        });
    }
};

export const getPedidoById = async (req, res) => {
    try {
        const pedido = await pedidosModelo.findByPk(req.params.id, {
            include: [
                {
                    model: estadosPedidoModelo,
                    as: 'estado'
                },
                {
                    model: clientesModelo,
                    as: 'cliente'
                },
                {
                    model: usuariosModelo,
                    as: 'usuario'
                },
                {
                    model: detallesPedidoModelo,
                    as: 'detalles',
                    include: [{
                        model: productosModelo,
                        as: 'producto'
                    }]
                }
            ]
        });
        
        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }
        
        return res.status(200).json(pedido);
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener el pedido",
            details: error.message 
        });
    }
};

export const createPedido = async (req, res) => {
    const { cliente_id, detalles, direccion_entrega, telefono_contacto, notas, metodo_pago } = req.body;
    
    try {
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ 
                error: "El pedido debe contener al menos un producto" 
            });
        }

        // Verificar cliente
        let cliente;
        if (cliente_id) {
            cliente = await clientesModelo.findByPk(cliente_id);
            if (!cliente) {
                return res.status(400).json({ 
                    error: "Cliente no encontrado" 
                });
            }
        }

        // Obtener estado inicial (por ejemplo, "Recibido")
        const estadoInicial = await estadosPedidoModelo.findOne({ 
            where: { nombre: 'Recibido' } 
        });
        
        if (!estadoInicial) {
            return res.status(500).json({ 
                error: "No se pudo determinar el estado inicial del pedido" 
            });
        }

        // Calcular totales
        let subtotal = 0;
        const productosConInfo = [];
        
        for (const detalle of detalles) {
            const producto = await productosModelo.findByPk(detalle.producto_id);
            if (!producto) {
                return res.status(400).json({ 
                    error: `Producto con ID ${detalle.producto_id} no encontrado` 
                });
            }
            
            if (!producto.activo) {
                return res.status(400).json({ 
                    error: `El producto ${producto.nombre} no está disponible` 
                });
            }
            
            const precio = producto.precio;
            const cantidad = detalle.cantidad || 1;
            const totalProducto = precio * cantidad;
            
            subtotal += totalProducto;
            
            productosConInfo.push({
                producto,
                cantidad,
                precio,
                instrucciones_especiales: detalle.instrucciones_especiales
            });
        }

        // Calcular impuestos (ejemplo: 13%)
        const impuestos = subtotal * 0.13;
        const total = subtotal + impuestos;

        // Crear el pedido
        const pedido = await pedidosModelo.create({
            cliente_id: cliente ? cliente.id : null,
            usuario_id: req.usuario.id, // Asumiendo que el usuario está autenticado
            estado_id: estadoInicial.id,
            direccion_entrega,
            telefono_contacto,
            notas,
            subtotal,
            impuestos,
            total,
            metodo_pago: metodo_pago || 'Efectivo'
        });

        // Crear los detalles del pedido
        for (const productoInfo of productosConInfo) {
            await detallesPedidoModelo.create({
                pedido_id: pedido.id,
                producto_id: productoInfo.producto.id,
                cantidad: productoInfo.cantidad,
                precio_unitario: productoInfo.precio,
                subtotal: productoInfo.precio * productoInfo.cantidad,
                instrucciones_especiales: productoInfo.instrucciones_especiales
            });
        }

        // Actualizar stock de ingredientes (si es necesario)
        // Esto podría moverse a un proceso separado o hacerse cuando el pedido se prepara
        // await actualizarStockPedido(pedido.id);

        // Obtener el pedido completo para devolverlo
        const pedidoCompleto = await pedidosModelo.findByPk(pedido.id, {
            include: [
                {
                    model: estadosPedidoModelo,
                    as: 'estado'
                },
                {
                    model: clientesModelo,
                    as: 'cliente'
                },
                {
                    model: usuariosModelo,
                    as: 'usuario'
                },
                {
                    model: detallesPedidoModelo,
                    as: 'detalles',
                    include: [{
                        model: productosModelo,
                        as: 'producto'
                    }]
                }
            ]
        });

        return res.status(201).json(pedidoCompleto);
    } catch (error) {
        console.error('Error al crear pedido:', error);
        return res.status(500).json({ 
            error: "Error interno al crear el pedido",
            details: error.message 
        });
    }
};

export const updateEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado_id } = req.body;

    try {
        const pedido = await pedidosModelo.findByPk(id);
        
        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }

        const estado = await estadosPedidoModelo.findByPk(estado_id);
        if (!estado) {
            return res.status(400).json({ 
                error: "Estado no válido" 
            });
        }

        // Verificar si el estado actual es final
        const estadoActual = await estadosPedidoModelo.findByPk(pedido.estado_id);
        if (estadoActual.es_final) {
            return res.status(400).json({ 
                error: "No se puede modificar un pedido en estado final" 
            });
        }

        await pedido.update({
            estado_id: estado.id
        });

        // Si el nuevo estado es "Entregado" o "Completado", generar factura
        if (estado.nombre === 'Entregado' || estado.nombre === 'Completado') {
            await generarFactura(pedido.id);
        }

        // Si el estado implica preparación, actualizar stock
        if (estado.nombre === 'En Preparación') {
            await actualizarStockPedido(pedido.id);
        }

        return res.status(200).json(pedido);
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        return res.status(500).json({ 
            error: "Error interno al actualizar el estado del pedido",
            details: error.message 
        });
    }
};

export const deletePedido = async (req, res) => {
    try {
        const pedido = await pedidosModelo.findByPk(req.params.id);
        
        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" });
        }

        // Verificar si el pedido ya tiene una factura
        const factura = await facturasModelo.findOne({ 
            where: { pedido_id: pedido.id } 
        });
        
        if (factura) {
            return res.status(400).json({ 
                error: "No se puede eliminar un pedido que ya tiene una factura asociada" 
            });
        }

        // Eliminar detalles primero
        await detallesPedidoModelo.destroy({ 
            where: { pedido_id: pedido.id } 
        });

        await pedido.destroy();
        return res.status(204).end();
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        return res.status(500).json({ 
            error: "Error interno al eliminar el pedido",
            details: error.message 
        });
    }
};

// Función auxiliar para generar factura
async function generarFactura(pedidoId) {
    const pedido = await pedidosModelo.findByPk(pedidoId, {
        include: [{
            model: detallesPedidoModelo,
            as: 'detalles',
            include: [{
                model: productosModelo,
                as: 'producto'
            }]
        }]
    });

    if (!pedido) {
        throw new Error('Pedido no encontrado');
    }

    // Verificar si ya existe una factura para este pedido
    const facturaExistente = await facturasModelo.findOne({ 
        where: { pedido_id: pedido.id } 
    });
    
    if (facturaExistente) {
        return facturaExistente;
    }

    // Generar número de factura (ejemplo: FAC-2023-0001)
    const ultimaFactura = await facturasModelo.findOne({
        order: [['fecha_emision', 'DESC']]
    });
    
    let numeroFactura;
    if (ultimaFactura) {
        const ultimoNumero = parseInt(ultimaFactura.numero_factura.split('-').pop());
        numeroFactura = `FAC-${new Date().getFullYear()}-${(ultimoNumero + 1).toString().padStart(4, '0')}`;
    } else {
        numeroFactura = `FAC-${new Date().getFullYear()}-0001`;
    }

    // Crear factura
    const factura = await facturasModelo.create({
        pedido_id: pedido.id,
        numero_factura: numeroFactura,
        fecha_emision: new Date(),
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días después
        estado: 'Pagada',
        subtotal: pedido.subtotal,
        impuestos: pedido.impuestos,
        total: pedido.total
    });

    // Crear detalles de factura
    for (const detalle of pedido.detalles) {
        await detallesFacturaModelo.create({
            factura_id: factura.id,
            producto_id: detalle.producto_id,
            descripcion: detalle.producto.nombre,
            cantidad: detalle.cantidad,
            precio_unitario: detalle.precio_unitario,
            subtotal: detalle.subtotal
        });
    }

    return factura;
}

// Función auxiliar para actualizar stock
async function actualizarStockPedido(pedidoId) {
    const pedido = await pedidosModelo.findByPk(pedidoId, {
        include: [{
            model: detallesPedidoModelo,
            as: 'detalles',
            include: [{
                model: productosModelo,
                as: 'producto',
                include: [{
                    model: recetasModelo,
                    as: 'recetas',
                    include: [{
                        model: ingredientesModelo,
                        as: 'ingrediente'
                    }]
                }]
            }]
        }]
    });

    if (!pedido) {
        throw new Error('Pedido no encontrado');
    }

    for (const detalle of pedido.detalles) {
        for (const receta of detalle.producto.recetas) {
            const cantidadNecesaria = receta.cantidad * detalle.cantidad;
            
            await ingredientesModelo.decrement('stock', {
                by: cantidadNecesaria,
                where: { id: receta.ingrediente.id }
            });
        }
    }
}