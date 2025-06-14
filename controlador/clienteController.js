import { Op } from 'sequelize';
import { clientesModelo } from '../conexion/conexion.js';

export const getAllClientes = async (req, res) => {
    try {
        const clientes = await clientesModelo.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        return res.status(200).json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener los clientes",
            details: error.message 
        });
    }
};

export const getClienteById = async (req, res) => {
    try {
        const cliente = await clientesModelo.findByPk(req.params.id);
        
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        
        return res.status(200).json(cliente);
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        return res.status(500).json({ 
            error: "Error interno al obtener el cliente",
            details: error.message 
        });
    }
};

export const createCliente = async (req, res) => {
    const { nombre, dui, direccion, telefono } = req.body;
    
    try {
        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (dui) {
            const existingCliente = await clientesModelo.findOne({ 
                where: { dui } 
            });
            if (existingCliente) {
                return res.status(400).json({ 
                    error: "Ya existe un cliente con este DUI" 
                });
            }
        }

        const cliente = await clientesModelo.create({
            nombre,
            dui,
            direccion,
            telefono
        });

        return res.status(201).json(cliente);
    } catch (error) {
        console.error('Error al crear cliente:', error);
        return res.status(500).json({ 
            error: "Error interno al crear el cliente",
            details: error.message 
        });
    }
};

export const updateCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, dui, direccion, telefono } = req.body;

    try {
        const cliente = await clientesModelo.findByPk(id);
        
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        if (dui && dui !== cliente.dui) {
            const existingCliente = await clientesModelo.findOne({ 
                where: { 
                    dui,
                    id: { [Op.ne]: id }
                } 
            });
            if (existingCliente) {
                return res.status(400).json({ 
                    error: "Ya existe otro cliente con este DUI" 
                });
            }
        }

        await cliente.update({
            nombre: nombre || cliente.nombre,
            dui: dui || cliente.dui,
            direccion: direccion || cliente.direccion,
            telefono: telefono || cliente.telefono
        });

        return res.status(200).json(cliente);
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        return res.status(500).json({ 
            error: "Error interno al actualizar el cliente",
            details: error.message 
        });
    }
};

export const deleteCliente = async (req, res) => {
    try {
        const cliente = await clientesModelo.findByPk(req.params.id);
        
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        await cliente.destroy();
        return res.status(204).end();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        return res.status(500).json({ 
            error: "Error interno al eliminar el cliente",
            details: error.message 
        });
    }
};