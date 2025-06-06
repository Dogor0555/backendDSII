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
        
        // Configurar cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 minutos
        });

        // Enviar respuesta
        res.status(200).json({ 
            mensaje: "Inicio de sesión exitoso",
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
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al cerrar sesión", error });
    }
};

export const verifyToken = async (req, res) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ mensaje: "No autorizado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await usuariosModelo.findByPk(decoded.id, {
            attributes: { exclude: ['contrasena', 'logo', 'passwordfirma'] }
        });

        if (!usuario) {
            return res.status(401).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ usuario });
    } catch (error) {
        res.status(401).json({ mensaje: "Token inválido" });
    }
};