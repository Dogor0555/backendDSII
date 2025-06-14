// controllers/cliente.controller.js
import { Op } from 'sequelize';

export const getAllClientes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { dui: { [Op.iLike]: `%${search}%` } },
        { telefono: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows: clientes } = await req.db.clientes.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      clientes,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getClienteById = async (req, res) => {
  try {
    const cliente = await req.db.clientes.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    return res.status(200).json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const createCliente = async (req, res) => {
  try {
    const { nombre, dui, direccion, telefono } = req.body;

    // Validación básica
    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    // Verificar si el DUI ya existe
    if (dui) {
      const existingCliente = await req.db.clientes.findOne({ where: { dui } });
      if (existingCliente) {
        return res.status(400).json({ error: "Ya existe un cliente con este DUI" });
      }
    }

    const cliente = await req.db.clientes.create({
      nombre,
      dui,
      direccion,
      telefono
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, dui, direccion, telefono } = req.body;

    const cliente = await req.db.clientes.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Verificar si el nuevo DUI ya existe en otro cliente
    if (dui && dui !== cliente.dui) {
      const existingCliente = await req.db.clientes.findOne({ 
        where: { 
          dui,
          id: { [Op.ne]: id } // Excluir el cliente actual
        } 
      });
      if (existingCliente) {
        return res.status(400).json({ error: "Ya existe otro cliente con este DUI" });
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
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteCliente = async (req, res) => {
  try {
    const cliente = await req.db.clientes.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    await cliente.destroy();
    return res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};