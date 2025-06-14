import { facturasModelo, detallesFacturaModelo, pedidosModelo } from '../conexion/conexion.js';
import PDFDocument from 'pdfkit';

export const getAllFacturas = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, estado } = req.query;
        
        const where = {};
        
        if (estado) {
            where.estado = estado;
        }
        
        if (fecha_inicio && fecha_fin) {
            where.fecha_emision = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }
        
        const facturas = await facturasModelo.findAll({
            where,
            include: [{
                model: pedidosModelo,
                as: 'pedido'
            }],
            order: [['fecha_emision', 'DESC']]
        });
        
        return res.status(200).json(facturas);
    } catch (error) {
        console.error('Error al obtener facturas:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener las facturas",
            details: error.message 
        });
    }
};

export const getFacturaById = async (req, res) => {
    try {
        const factura = await facturasModelo.findByPk(req.params.id, {
            include: [
                {
                    model: pedidosModelo,
                    as: 'pedido',
                    include: [
                        {
                            model: clientesModelo,
                            as: 'cliente'
                        },
                        {
                            model: usuariosModelo,
                            as: 'usuario'
                        }
                    ]
                },
                {
                    model: detallesFacturaModelo,
                    as: 'detalles'
                }
            ]
        });
        
        if (!factura) {
            return res.status(404).json({ error: "Factura no encontrada" });
        }
        
        return res.status(200).json(factura);
    } catch (error) {
        console.error('Error al obtener factura:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener la factura",
            details: error.message 
        });
    }
};

export const generarFacturaPDF = async (req, res) => {
    try {
        const factura = await facturasModelo.findByPk(req.params.id, {
            include: [
                {
                    model: pedidosModelo,
                    as: 'pedido',
                    include: [
                        {
                            model: clientesModelo,
                            as: 'cliente'
                        },
                        {
                            model: usuariosModelo,
                            as: 'usuario'
                        }
                    ]
                },
                {
                    model: detallesFacturaModelo,
                    as: 'detalles'
                }
            ]
        });
        
        if (!factura) {
            return res.status(404).json({ error: "Factura no encontrada" });
        }

        // Crear el documento PDF
        const doc = new PDFDocument({ margin: 50 });
        
        // Configurar los headers para la descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=factura-${factura.numero_factura}.pdf`);
        
        // Pipe el PDF a la respuesta
        doc.pipe(res);

        // Logo (opcional)
        // doc.image('logo.png', 50, 45, { width: 50 });

        // Información de la empresa
        doc.fontSize(20).text('Pizzería Deliciosa', 110, 57);
        doc.fontSize(10)
           .text('Calle Principal #123', 200, 65, { align: 'right' })
           .text('Ciudad, País', 200, 80, { align: 'right' })
           .text('Teléfono: +123 456 7890', 200, 95, { align: 'right' })
           .text('Email: info@pizzeriadeliciosa.com', 200, 110, { align: 'right' });

        // Línea divisoria
        doc.moveTo(50, 130).lineTo(550, 130).stroke();

        // Título del documento
        doc.fontSize(20).text('FACTURA', 50, 140);
        doc.fontSize(10)
           .text(`Número: ${factura.numero_factura}`, 50, 170)
           .text(`Fecha Emisión: ${factura.fecha_emision.toLocaleDateString()}`, 50, 185)
           .text(`Fecha Vencimiento: ${factura.fecha_vencimiento.toLocaleDateString()}`, 50, 200)
           .text(`Estado: ${factura.estado}`, 50, 215);

        // Información del cliente
        const cliente = factura.pedido.cliente;
        doc.fontSize(14).text('Cliente:', 350, 160);
        doc.fontSize(10)
           .text(`Nombre: ${cliente.nombre}`, 350, 180)
           .text(`DUI: ${cliente.dui || 'N/A'}`, 350, 195)
           .text(`Dirección: ${cliente.direccion || 'N/A'}`, 350, 210)
           .text(`Teléfono: ${cliente.telefono || 'N/A'}`, 350, 225);

        // Línea divisoria
        doc.moveTo(50, 250).lineTo(550, 250).stroke();

        // Detalles de la factura
        doc.fontSize(14).text('Detalles de la Factura', 50, 260);
        
        // Tabla de productos
        const tableTop = 290;
        let y = tableTop;
        
        // Encabezados de la tabla
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text('Descripción', 50, y)
           .text('Cantidad', 280, y, { width: 50, align: 'right' })
           .text('Precio Unit.', 350, y, { width: 60, align: 'right' })
           .text('Subtotal', 430, y, { width: 70, align: 'right' });
        
        doc.font('Helvetica');
        y += 25;
        
        // Productos
        for (const detalle of factura.detalles) {
            doc.fontSize(10)
               .text(detalle.descripcion, 50, y)
               .text(detalle.cantidad.toString(), 280, y, { width: 50, align: 'right' })
               .text(`$${detalle.precio_unitario.toFixed(2)}`, 350, y, { width: 60, align: 'right' })
               .text(`$${detalle.subtotal.toFixed(2)}`, 430, y, { width: 70, align: 'right' });
            
            y += 20;
            
            // Espacio limitado, verificar si necesitamos una nueva página
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
        }

        // Línea divisoria
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 20;

        // Totales
        doc.font('Helvetica-Bold')
           .text('Subtotal:', 350, y, { width: 150, align: 'right' })
           .text(`$${factura.subtotal.toFixed(2)}`, 430, y, { width: 70, align: 'right' });
        
        y += 20;
        
        doc.text('Impuestos (13%):', 350, y, { width: 150, align: 'right' })
           .text(`$${factura.impuestos.toFixed(2)}`, 430, y, { width: 70, align: 'right' });
        
        y += 20;
        
        if (factura.descuento > 0) {
            doc.text('Descuento:', 350, y, { width: 150, align: 'right' })
               .text(`-$${factura.descuento.toFixed(2)}`, 430, y, { width: 70, align: 'right' });
            
            y += 20;
        }
        
        doc.text('Total:', 350, y, { width: 150, align: 'right' })
           .text(`$${factura.total.toFixed(2)}`, 430, y, { width: 70, align: 'right' });

        // Notas
        y += 40;
        doc.font('Helvetica')
           .fontSize(10)
           .text('Notas:', 50, y)
           .text(factura.pedido.notas || 'Ninguna', 50, y + 15, { width: 500 });

        // Pie de página
        y += 60;
        doc.fontSize(8)
           .text('Gracias por su compra!', 50, y, { align: 'center' })
           .text('Pizzería Deliciosa - Todos los derechos reservados', 50, y + 15, { align: 'center' });

        // Finalizar el documento
        doc.end();

    } catch (error) {
        console.error('Error al generar el PDF de la factura:', error);
        res.status(500).json({ 
            error: "Error interno al generar el PDF",
            details: error.message 
        });
    }
};

export const anularFactura = async (req, res) => {
    try {
        const factura = await facturasModelo.findByPk(req.params.id);
        
        if (!factura) {
            return res.status(404).json({ error: "Factura no encontrada" });
        }

        if (factura.estado === 'Anulada') {
            return res.status(400).json({ 
                error: "La factura ya está anulada" 
            });
        }

        await factura.update({
            estado: 'Anulada'
        });

        // Opcional: Revertir el stock si es necesario
        // await revertirStockFactura(factura.id);

        return res.status(200).json(factura);
    } catch (error) {
        console.error('Error al anular factura:', error);
        return res.status(500).json({ 
            error: "Error interno al anular la factura",
            details: error.message 
        });
    }
};