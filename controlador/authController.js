import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { usuariosModelo } from "../conexion/conexion.js";
dotenv.config();

export const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id, 
      correo: usuario.correo,
      nombre: usuario.nombre,
      nit: usuario.nit,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const generarRefreshToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const usuario = await usuariosModelo.findOne({ where: { correo } });
    
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const passwordValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = generarToken(usuario);
    const refreshToken = generarRefreshToken(usuario);
    
    // Actualizar refresh token en la base de datos
    await usuario.update({ refreshToken });
    
    // Excluir datos sensibles en la respuesta
    const { contrasena: _, passwordfirma, refreshToken: rt, ...usuarioResponse } = usuario.toJSON();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.status(200).json({ 
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: usuarioResponse
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const usuario = await usuariosModelo.findOne({ where: { refreshToken } });
      if (usuario) {
        await usuario.update({ refreshToken: null });
      }
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ mensaje: "Error al cerrar sesión" });
  }
};

export const verifyToken = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ mensaje: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await usuariosModelo.findByPk(decoded.id, {
      attributes: { exclude: ['contrasena', 'passwordfirma', 'refreshToken'] }
    });

    if (!usuario) {
      return res.status(401).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ usuario });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: "Token expirado" });
    }
    res.status(401).json({ mensaje: "Token inválido" });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ mensaje: "Refresh token no proporcionado" });
  }

  try {
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const usuario = await usuariosModelo.findByPk(decoded.id);

    if (!usuario || usuario.refreshToken !== refreshToken) {
      return res.status(403).json({ mensaje: "Refresh token inválido" });
    }

    // Generar nuevo token de acceso
    const newToken = generarToken(usuario);
    const newRefreshToken = generarRefreshToken(usuario);
    
    // Actualizar refresh token en la base de datos
    await usuario.update({ refreshToken: newRefreshToken });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.json({ token: newToken });
  } catch (error) {
    console.error("Error en refreshToken:", error);
    res.status(403).json({ mensaje: "Refresh token inválido" });
  }
};