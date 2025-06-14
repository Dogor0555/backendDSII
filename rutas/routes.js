import express from 'express';
import multer from 'multer';
import { 
  getAllUsu, 
  addUsu, 
  updateUsu, 
  deleteUsu, 
  getUsuarioById 
} from '../controlador/usuarioController.js';
import { authMiddleware } from "../controlador/authMiddelware.js";
import { login, logout, verifyToken, refreshToken } from '../controlador/authController.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB para imágenes
    files: 1
  }
});

// Rutas de autenticación (públicas)
router.post("/login", login);
router.post("/logout", logout);
router.get("/verifyToken", verifyToken);
router.post("/refreshToken", refreshToken);

// Rutas para usuarios (protegidas por authMiddleware)
router.get("/usuarios", authMiddleware(['admin']), getAllUsu);
router.get("/usuarios/:id", authMiddleware(['admin', 'vendedor']), getUsuarioById);
router.post("/usuarios", 
  authMiddleware(['admin']), 
  upload.single('logo'), 
  addUsu
);
router.put("/usuarios/:id", 
  authMiddleware(['admin']), 
  upload.single('logo'), 
  updateUsu
);
router.delete("/usuarios/:id", authMiddleware(['admin']), deleteUsu);

// Rutas para dashboard
router.get("/admin/dashboard", authMiddleware(['admin']), (req, res) => {
  res.json({ 
    mensaje: "Bienvenido al dashboard de administración",
    user: req.user 
  });
});

router.get("/vendedor/dashboard", authMiddleware(['vendedor']), (req, res) => {
  res.json({ 
    mensaje: "Bienvenido al dashboard de vendedor",
    user: req.user 
  });
});

// Ruta para verificar roles
router.get("/check-role/:role", authMiddleware(), (req, res) => {
  const { role } = req.params;
  if (req.user.roles.includes(role)) {
    return res.json({ hasRole: true });
  }
  res.json({ hasRole: false });
});

export default router;