import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authMiddleware = (rolesPermitidos = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ mensaje: "Token no proporcionado" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar si el usuario tiene los roles necesarios
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(decoded.rol)) {
        return res.status(403).json({ mensaje: "No tienes permisos para esta acción" });
      }

      // Adjuntar usuario a la solicitud
      req.user = {
        id: decoded.id,
        correo: decoded.correo,
        rol: decoded.rol,
        nombre: decoded.nombre
      };

      next();
    } catch (error) {
      console.error("Error en authMiddleware:", error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ mensaje: "Token expirado" });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ mensaje: "Token inválido" });
      }
      
      res.status(500).json({ mensaje: "Error de autenticación" });
    }
  };
};