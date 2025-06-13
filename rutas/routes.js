import express from 'express';
import { getAllUsu, addUsu, updateUsu, deleteUsu, getUsuarioById } from '../controlador/usuarioController.js';
import { authMiddleware } from "../controlador/authMiddelware.js";
import { login, logout, verifyToken } from '../controlador/authController.js'; // Importar verifyToken

const router = express.Router();

// Rutas de autenticación (públicas)
router.post("/login", login);
router.post("/logout", logout);
router.get("/verifyToken", verifyToken); // ← AGREGAR ESTA RUTA

// Rutas para usuarios (protegidas por authMiddleware)
router.get("/usuarios/getAll", authMiddleware, getAllUsu);
router.get("/usuarios/:usuId", authMiddleware, getUsuarioById);
router.post("/usuarios/add", authMiddleware, addUsu);
router.put("/usuarios/update/:usuId", authMiddleware, updateUsu);
router.delete("/usuarios/delete/:usuId", authMiddleware, deleteUsu);

router.get("/test", (req, res) => {
  res.send("¡El servidor SIIIIIIIII funciona!");
});

export default router;