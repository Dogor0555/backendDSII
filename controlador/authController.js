import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { usuariosModelo } from "../conexion/conexion.js";
dotenv.config();

const generarToken = (usuario) => {
    return jwt.sign(
        { 
            id: usuario.id, 
            email: usuario.correo,
            nombre: usuario.nombre,
            nit: usuario.nit
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // 15 minutos de expiración
    );
};

export const login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const usuario = await usuariosModelo.findOne({ where: { correo } });
        
        if (!usuario) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!passwordValido) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" });
        }

        // Generar token
        const token = generarToken(usuario);
        
        // Enviar token en la respuesta JSON (no como cookie)
        res.status(200).json({ 
            mensaje: "Inicio de sesión exitoso",
            token, // Enviamos el token en el cuerpo de la respuesta
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                nit: usuario.nit
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
};

export const logout = async (req, res) => {
    // En este enfoque, el logout se maneja principalmente en el frontend
    res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
};

// Middleware de autenticación actualizado para usar el token del header
export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ mensaje: "Acceso denegado. No hay token" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await usuariosModelo.findByPk(decoded.id, {
            attributes: { exclude: ['contrasena', 'logo', 'passwordfirma'] }
        });

        if (!usuario) {
            return res.status(401).json({ mensaje: "Usuario no encontrado" });
        }

        req.user = usuario;
        next();
    } catch (error) {
        console.error("Error en authMiddleware:", error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: "Token expirado" });
        }
        
        return res.status(401).json({ mensaje: "Token inválido" });
    }
};