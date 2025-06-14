// rutas/routes.js
import express from 'express';
import { getAllUsu, addUsu, updateUsu, deleteUsu, getUsuarioById } from '../controlador/usuarioController.js';
import { authMiddleware } from "../controlador/authMiddelware.js";
import { login, logout, verifyToken } from '../controlador/authController.js';

const router = express.Router();

// Rutas de autenticación (públicas)
router.post("/login", login);
router.post("/logout", logout);
router.get("/verifyToken", verifyToken);

// Rutas para usuarios (protegidas por authMiddleware)
router.get("/usuarios/getAll", authMiddleware(['admin']), getAllUsu);
router.get("/usuarios/:usuId", authMiddleware(['admin', 'vendedor']), getUsuarioById);
router.post("/usuarios/add", authMiddleware(['admin']), addUsu);
router.put("/usuarios/update/:usuId", authMiddleware(['admin']), updateUsu);
router.delete("/usuarios/delete/:usuId", authMiddleware(['admin']), deleteUsu);

// Rutas para admin
router.get("/admin/dashboard", authMiddleware(['admin']), (req, res) => {
    res.json({ mensaje: "Bienvenido al dashboard de administración" });
});

// Rutas para vendedor
router.get("/vendedor/dashboard", authMiddleware(['vendedor']), (req, res) => {
    res.json({ mensaje: "Bienvenido al dashboard de vendedor" });
});

export default router;