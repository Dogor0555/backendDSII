// rutas/routes.js
import express from 'express';
import { getAllUsu, addUsu, updateUsu, deleteUsu, getUsuarioById } from '../controlador/usuarioController.js';
import { authMiddleware } from "../controlador/authMiddelware.js";
import { login, logout, verifyToken } from '../controlador/authController.js';

// Controladores de clientes
import { 
  getAllClientes, 
  getClienteById, 
  createCliente, 
  updateCliente, 
  deleteCliente 
} from '../controlador/clienteController.js';

// Controladores de ingredientes
import { 
  getAllIngredientes,
  getIngredienteById,
  createIngrediente,
  updateIngrediente,
  deleteIngrediente
} from '../controlador/ingredienteController.js';

// Controladores de productos
import { 
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controlador/productoController.js';

// Controladores de pedidos
import { 
  getAllPedidos,
  getPedidoById,
  createPedido,
  updateEstadoPedido,
  deletePedido
} from '../controlador/pedidoController.js';

// Controladores de facturas
import { 
  getAllFacturas,
  getFacturaById,
  generarFacturaPDF,
  anularFactura
} from '../controlador/facturaController.js';

// Controladores de reportes
import { 
  generarReporteClientesPDF,
  generarReportePedidosPDF,
  generarReporteInventarioPDF,
  generarReporteProductosVendidosPDF
} from '../controlador/reporteController.js';

const router = express.Router();

// ==============================================
// Rutas de autenticación (públicas)
// ==============================================
router.post("/login", login);
router.post("/logout", logout);
router.get("/verifyToken", verifyToken);

// ==============================================
// Rutas para usuarios
// ==============================================
router.get("/usuarios/getAll", authMiddleware(['admin']), getAllUsu);
router.get("/usuarios/:id", authMiddleware(['admin', 'vendedor']), getUsuarioById);
router.post("/usuarios/add", authMiddleware(['admin']), addUsu);
router.put("/usuarios/update/:id", authMiddleware(['admin']), updateUsu);
router.delete("/usuarios/delete/:id", authMiddleware(['admin']), deleteUsu);

// ==============================================
// Rutas para clientes
// ==============================================
router.get('/clientes', authMiddleware(['admin', 'vendedor']), getAllClientes);
router.get('/clientes/:id', authMiddleware(['admin', 'vendedor']), getClienteById);
router.post('/clientes', authMiddleware(['admin']), createCliente);
router.put('/clientes/:id', authMiddleware(['admin']), updateCliente);
router.delete('/clientes/:id', authMiddleware(['admin']), deleteCliente);

// ==============================================
// Rutas para ingredientes
// ==============================================
router.get('/ingredientes', authMiddleware(['admin', 'cocina']), getAllIngredientes);
router.get('/ingredientes/:id', authMiddleware(['admin', 'cocina']), getIngredienteById);
router.post('/ingredientes', authMiddleware(['admin']), createIngrediente);
router.put('/ingredientes/:id', authMiddleware(['admin']), updateIngrediente);
router.delete('/ingredientes/:id', authMiddleware(['admin']), deleteIngrediente);

// ==============================================
// Rutas para productos
// ==============================================
router.get('/productos', authMiddleware(['admin', 'vendedor', 'cocina']), getAllProductos);
router.get('/productos/:id', authMiddleware(['admin', 'vendedor', 'cocina']), getProductoById);
router.post('/productos', authMiddleware(['admin']), createProducto);
router.put('/productos/:id', authMiddleware(['admin']), updateProducto);
router.delete('/productos/:id', authMiddleware(['admin']), deleteProducto);

// ==============================================
// Rutas para pedidos
// ==============================================
router.get('/pedidos', authMiddleware(['admin', 'vendedor', 'cocina']), getAllPedidos);
router.get('/pedidos/:id', authMiddleware(['admin', 'vendedor', 'cocina']), getPedidoById);
router.post('/pedidos', authMiddleware(['admin', 'vendedor']), createPedido);
router.put('/pedidos/:id/estado', authMiddleware(['admin', 'cocina']), updateEstadoPedido);
router.delete('/pedidos/:id', authMiddleware(['admin']), deletePedido);

// ==============================================
// Rutas para facturas
// ==============================================
router.get('/facturas', authMiddleware(['admin', 'vendedor']), getAllFacturas);
router.get('/facturas/:id', authMiddleware(['admin', 'vendedor']), getFacturaById);
router.get('/facturas/:id/pdf', authMiddleware(['admin', 'vendedor']), generarFacturaPDF);
router.put('/facturas/:id/anular', authMiddleware(['admin']), anularFactura);

// ==============================================
// Rutas para reportería
// ==============================================
router.get('/reportes/clientes-pdf', authMiddleware(['admin', 'vendedor']), generarReporteClientesPDF);
router.get('/reportes/pedidos-pdf', authMiddleware(['admin']), generarReportePedidosPDF);
router.get('/reportes/inventario-pdf', authMiddleware(['admin', 'cocina']), generarReporteInventarioPDF);
router.get('/reportes/productos-vendidos-pdf', authMiddleware(['admin']), generarReporteProductosVendidosPDF);

// ==============================================
// Rutas para dashboards
// ==============================================
router.get("/admin/dashboard", authMiddleware(['admin']), (req, res) => {
    res.json({ mensaje: "Bienvenido al dashboard de administración" });
});

router.get("/vendedor/dashboard", authMiddleware(['vendedor']), (req, res) => {
    res.json({ mensaje: "Bienvenido al dashboard de vendedor" });
});

router.get("/cocina/dashboard", authMiddleware(['cocina']), (req, res) => {
    res.json({ mensaje: "Bienvenido al dashboard de cocina" });
});

export default router;