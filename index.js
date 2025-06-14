import express from 'express';
import { connection } from './conexion/conexion.js';
import router from './rutas/routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Configuración de CORS
// Configuración mejorada de CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://frontproyectobdsii.vercel.app',
      'http://localhost:3000'
    ];
    
    // Permitir solicitudes sin origen (como apps móviles o Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // credentials: true, // Solo si usas cookies/sesiones
  maxAge: 86400 // Cachear configuración CORS por 24 horas
};

app.use(cors(corsOptions));

// Manejador explícito para OPTIONS
app.options('*', cors(corsOptions));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT; // Sin valor por defecto

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Hora del servidor: ${new Date().toLocaleString()}`);
});

// Conectar a la base de datos
connection();