import PDFDocument from 'pdfkit';
import { clientesModelo } from '../conexion/conexion.js';

export const generarReporteClientesPDF = async (req, res) => {
    try {
        // Obtener todos los clientes
        const clientes = await clientesModelo.findAll({
            order: [['id', 'DESC']]
        });

        // Crear el documento PDF
        const doc = new PDFDocument();
        
        // Configurar los headers para la descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte-clientes.pdf');
        
        // Pipe el PDF a la respuesta
        doc.pipe(res);

        // Agregar contenido al PDF
        doc.fontSize(20).text('Reporte de Clientes', { align: 'center' });
        doc.moveDown();
        
        // Fecha del reporte
        doc.fontSize(12).text(`Generado el: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(2);

        // Tabla de clientes
        doc.fontSize(12);
        
        // Encabezados de la tabla
        doc.text('ID', 50, doc.y);
        doc.text('Nombre', 100, doc.y);
        doc.text('DUI', 250, doc.y);
        doc.text('Teléfono', 350, doc.y);
        doc.text('Dirección', 450, doc.y);
        
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Filas de la tabla
        let y = doc.y;
        clientes.forEach((cliente, index) => {
            doc.text(cliente.id.toString(), 50, y);
            doc.text(cliente.nombre, 100, y);
            doc.text(cliente.dui || 'N/A', 250, y);
            doc.text(cliente.telefono || 'N/A', 350, y);
            doc.text(cliente.direccion || 'N/A', 450, y);
            
            y += 25;
            
            // Agregar línea separadora si no es el último elemento
            if (index < clientes.length - 1) {
                doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke();
            }
        });

        // Finalizar el documento
        doc.end();

    } catch (error) {
        console.error('Error al generar el reporte PDF:', error);
        res.status(500).json({ 
            error: "Error interno al generar el reporte",
            details: error.message 
        });
    }
};