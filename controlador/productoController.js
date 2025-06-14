import { Op } from 'sequelize';
import { productosModelo, categoriasProductoModelo } from '../conexion/conexion.js';

export const getAllProductos = async (req, res) => {
    try {
        const { categoria, activo } = req.query;
        
        const where = {};
        
        if (categoria) {
            where.categoria_id = categoria;
        }
        
        if (activo !== undefined) {
            where.activo = activo === 'true';
        }
        
        const productos = await productosModelo.findAll({
            where,
            include: [{
                model: categoriasProductoModelo,
                as: 'categoria'
            }],
            order: [['nombre', 'ASC']]
        });
        
        return res.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener los productos",
            details: error.message 
        });
    }
};

export const getProductoById = async (req, res) => {
    try {
        const producto = await productosModelo.findByPk(req.params.id, {
            include: [{
                model: categoriasProductoModelo,
                as: 'categoria'
            }]
        });
        
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        return res.status(200).json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener el producto",
            details: error.message 
        });
    }
};

export const createProducto = async (req, res) => {
    const { nombre, descripcion, precio, categoria_id, imagen_url, es_personalizable } = req.body;
    
    try {
        if (!nombre || !precio || !categoria_id) {
            return res.status(400).json({ 
                error: "Nombre, precio y categoría son obligatorios" 
            });
        }

        const categoria = await categoriasProductoModelo.findByPk(categoria_id);
        if (!categoria) {
            return res.status(400).json({ 
                error: "Categoría no encontrada" 
            });
        }

        const producto = await productosModelo.create({
            nombre,
            descripcion,
            precio,
            categoria_id,
            imagen_url,
            es_personalizable,
            activo: true
        });

        return res.status(201).json(producto);
    } catch (error) {
        console.error('Error al crear producto:', error);
        return res.status(500).json({ 
            error: "Error interno al crear el producto",
            details: error.message 
        });
    }
};

export const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria_id, imagen_url, activo, es_personalizable } = req.body;

    try {
        const producto = await productosModelo.findByPk(id);
        
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        if (categoria_id) {
            const categoria = await categoriasProductoModelo.findByPk(categoria_id);
            if (!categoria) {
                return res.status(400).json({ 
                    error: "Categoría no encontrada" 
                });
            }
        }

        await producto.update({
            nombre: nombre || producto.nombre,
            descripcion: descripcion || producto.descripcion,
            precio: precio || producto.precio,
            categoria_id: categoria_id || producto.categoria_id,
            imagen_url: imagen_url || producto.imagen_url,
            activo: activo !== undefined ? activo : producto.activo,
            es_personalizable: es_personalizable !== undefined ? es_personalizable : producto.es_personalizable,
            fecha_actualizacion: new Date()
        });

        return res.status(200).json(producto);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        return res.status(500).json({ 
            error: "Error interno al actualizar el producto",
            details: error.message 
        });
    }
};

export const deleteProducto = async (req, res) => {
    try {
        const producto = await productosModelo.findByPk(req.params.id);
        
        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Verificar si el producto está en algún pedido
        const detallesPedido = await detallesPedidoModelo.count({
            where: { producto_id: req.params.id }
        });
        
        if (detallesPedido > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar el producto porque está asociado a uno o más pedidos" 
            });
        }

        await producto.destroy();
        return res.status(204).end();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return res.status(500).json({ 
            error: "Error interno al eliminar el producto",
            details: error.message 
        });
    }
};