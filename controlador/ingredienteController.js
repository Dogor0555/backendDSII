import { Op } from 'sequelize';
import { ingredientesModelo } from '../conexion/conexion.js';

export const getAllIngredientes = async (req, res) => {
    try {
        const ingredientes = await ingredientesModelo.findAll({
            order: [['nombre', 'ASC']]
        });
        
        return res.status(200).json(ingredientes);
    } catch (error) {
        console.error('Error al obtener ingredientes:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener los ingredientes",
            details: error.message 
        });
    }
};

export const getIngredienteById = async (req, res) => {
    try {
        const ingrediente = await ingredientesModelo.findByPk(req.params.id);
        
        if (!ingrediente) {
            return res.status(404).json({ error: "Ingrediente no encontrado" });
        }
        
        return res.status(200).json(ingrediente);
    } catch (error) {
        console.error('Error al obtener ingrediente:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener el ingrediente",
            details: error.message 
        });
    }
};

export const createIngrediente = async (req, res) => {
    const { nombre, descripcion, stock, unidad_medida, costo_por_unidad } = req.body;
    
    try {
        if (!nombre || !stock || !unidad_medida || !costo_por_unidad) {
            return res.status(400).json({ 
                error: "Nombre, stock, unidad_medida y costo_por_unidad son obligatorios" 
            });
        }

        const existingIngrediente = await ingredientesModelo.findOne({ 
            where: { nombre } 
        });
        
        if (existingIngrediente) {
            return res.status(400).json({ 
                error: "Ya existe un ingrediente con este nombre" 
            });
        }

        const ingrediente = await ingredientesModelo.create({
            nombre,
            descripcion,
            stock,
            unidad_medida,
            costo_por_unidad
        });

        return res.status(201).json(ingrediente);
    } catch (error) {
        console.error('Error al crear ingrediente:', error);
        return res.status(500).json({ 
            error: "Error interno al crear el ingrediente",
            details: error.message 
        });
    }
};

export const updateIngrediente = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, stock, unidad_medida, costo_por_unidad } = req.body;

    try {
        const ingrediente = await ingredientesModelo.findByPk(id);
        
        if (!ingrediente) {
            return res.status(404).json({ error: "Ingrediente no encontrado" });
        }

        if (nombre && nombre !== ingrediente.nombre) {
            const existingIngrediente = await ingredientesModelo.findOne({ 
                where: { 
                    nombre,
                    id: { [Op.ne]: id }
                } 
            });
            if (existingIngrediente) {
                return res.status(400).json({ 
                    error: "Ya existe otro ingrediente con este nombre" 
                });
            }
        }

        await ingrediente.update({
            nombre: nombre || ingrediente.nombre,
            descripcion: descripcion || ingrediente.descripcion,
            stock: stock || ingrediente.stock,
            unidad_medida: unidad_medida || ingrediente.unidad_medida,
            costo_por_unidad: costo_por_unidad || ingrediente.costo_por_unidad,
            fecha_actualizacion: new Date()
        });

        return res.status(200).json(ingrediente);
    } catch (error) {
        console.error('Error al actualizar ingrediente:', error);
        return res.status(500).json({ 
            error: "Error interno al actualizar el ingrediente",
            details: error.message 
        });
    }
};

export const deleteIngrediente = async (req, res) => {
    try {
        const ingrediente = await ingredientesModelo.findByPk(req.params.id);
        
        if (!ingrediente) {
            return res.status(404).json({ error: "Ingrediente no encontrado" });
        }

        // Verificar si el ingrediente está siendo usado en alguna receta
        const recetas = await recetasModelo.count({
            where: { ingrediente_id: req.params.id }
        });
        
        if (recetas > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar el ingrediente porque está siendo usado en una o más recetas" 
            });
        }

        await ingrediente.destroy();
        return res.status(204).end();
    } catch (error) {
        console.error('Error al eliminar ingrediente:', error);
        return res.status(500).json({ 
            error: "Error interno al eliminar el ingrediente",
            details: error.message 
        });
    }
};