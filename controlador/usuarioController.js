import { usuariosModelo } from "../conexion/conexion.js";
import bcrypt from 'bcryptjs';
import { generarToken } from './authController.js';

export const getAllUsu = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { correo: { [Op.iLike]: `%${search}%` } },
        { nit: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await usuariosModelo.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['contrasena', 'passwordfirma', 'logo'] }
    });

    res.json({
      usuarios: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ mensaje: "Error al obtener usuarios", error });
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const usuario = await usuariosModelo.findByPk(req.params.id, {
      attributes: { exclude: ['contrasena', 'passwordfirma'] }
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Solo admins pueden ver todos los datos, vendedores solo los básicos
    if (req.user.rol !== 'admin') {
      const { id, nombre, correo, telefono, rol } = usuario;
      return res.json({ id, nombre, correo, telefono, rol });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ mensaje: "Error al obtener usuario", error });
  }
};

export const addUsu = async (req, res) => {
  try {
    const { contrasena, ...usuarioData } = req.body;
    const logo = req.file ? req.file.buffer.toString('base64') : null;

    // Validar campos requeridos
    if (!contrasena || !usuarioData.correo || !usuarioData.nombre) {
      return res.status(400).json({ mensaje: "Campos requeridos faltantes" });
    }

    // Verificar si el correo ya existe
    const existeUsuario = await usuariosModelo.findOne({ 
      where: { correo: usuarioData.correo } 
    });
    
    if (existeUsuario) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const hashedFirma = await bcrypt.hash(usuarioData.passwordfirma, 10);

    const nuevoUsuario = await usuariosModelo.create({
      ...usuarioData,
      contrasena: hashedPassword,
      passwordfirma: hashedFirma,
      logo
    });

    // Excluir datos sensibles en la respuesta
    const { passwordfirma, contrasena: _, ...usuarioResponse } = nuevoUsuario.toJSON();

    res.status(201).json({
      mensaje: "Usuario creado exitosamente",
      usuario: usuarioResponse,
      token: generarToken(nuevoUsuario)
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ mensaje: "Error al crear usuario", error });
  }
};

export const updateUsu = async (req, res) => {
  try {
    const { id } = req.params;
    const { contrasena, passwordfirma, ...usuarioData } = req.body;
    let logo = null;

    // Manejar el logo
    if (req.file) {
      logo = req.file.buffer.toString('base64');
    } else if (req.body.mantenerLogo === 'true') {
      // Mantener el logo existente
      const usuarioExistente = await usuariosModelo.findByPk(id);
      if (usuarioExistente) {
        logo = usuarioExistente.logo;
      }
    }

    const updateData = { ...usuarioData };
    if (logo !== null) updateData.logo = logo;

    // Actualizar contraseña si se proporciona
    if (contrasena) {
      updateData.contrasena = await bcrypt.hash(contrasena, 10);
    }

    // Actualizar passwordfirma si se proporciona
    if (passwordfirma) {
      updateData.passwordfirma = await bcrypt.hash(passwordfirma, 10);
    }

    const [updated] = await usuariosModelo.update(updateData, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const usuarioActualizado = await usuariosModelo.findByPk(id, {
      attributes: { exclude: ['contrasena', 'passwordfirma'] }
    });

    res.json({
      mensaje: "Usuario actualizado exitosamente",
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ mensaje: "Error al actualizar usuario", error });
  }
};

export const deleteUsu = async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir auto-eliminación
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ mensaje: "No puedes eliminar tu propio usuario" });
    }

    const deleted = await usuariosModelo.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ mensaje: "Error al eliminar usuario", error });
  }
};