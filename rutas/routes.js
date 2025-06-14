// rutas/routes.js
import express from 'express';
import { getAllUsu, addUsu, updateUsu, deleteUsu, getUsuarioById } from '../controlador/usuarioController.js';
import { authMiddleware } from "../controlador/authMiddelware.js";
import { login, logout, verifyToken } from '../controlador/authController.js';
import { generarReporteClientesPDF } from '../controlador/reporteController.js';


import { 
  getAllClientes, 
  getClienteById, 
  createCliente, 
  updateCliente, 
  deleteCliente 
} from '../controlador/clienteController.js';

const router = express.Router();

// Rutas para clientes
router.get('/clientes', authMiddleware(['admin', 'vendedor']), getAllClientes);
router.get('/clientes/:id', authMiddleware(['admin', 'vendedor']), getClienteById);
router.post('/clientes', authMiddleware(['admin']), createCliente);
router.put('/clientes/:id', authMiddleware(['admin']), updateCliente);
router.delete('/clientes/:id', authMiddleware(['admin']), deleteCliente);



// Rutas de autenticación (públicas)
router.post("/login", login);
router.post("/logout", logout);
router.get("/verifyToken", verifyToken);

// Rutas para usuarios (protegidas por authMiddleware)
router.get("/usuarios/getAll", authMiddleware(['admin']), getAllUsu);
router.get("/usuarios/:id", authMiddleware(['admin', 'vendedor']), getUsuarioById);
router.post("/usuarios/add", authMiddleware(['admin']), addUsu);
router.put("/usuarios/update/:id", authMiddleware(['admin']), updateUsu);
router.delete("/usuarios/delete/:id", authMiddleware(['admin']), deleteUsu);

// Rutas para admin
router.get("/admin/dashboard", authMiddleware(['admin']), (req, res) => {
    res.json({ mensaje: "Bienvenido al dashboard de administración" });
});

// Rutas para vendedor
router.get("/vendedor/dashboard", authMiddleware(['vendedor']), (req, res) => {
    res.json({ mensaje: "Bienvenido al dashboard de vendedor" });
});


//Reporteria

router.get('/clientes/reporte-pdf', authMiddleware(['admin', 'vendedor']), generarReporteClientesPDF);

export default router;