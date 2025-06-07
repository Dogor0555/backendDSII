import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { usuariosModelo } from "../conexion/conexion.js";

dotenv.config();

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