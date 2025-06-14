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
const corsOptions = {
  origin: [
    'https://frontproyectobdsii.vercel.app',
    'http://localhost:3000' // Para desarrollo local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cachear configuración CORS por 24 horas
};

app.use(cors(corsOptions));

// Manejador explícito para OPTIONS (preflight)
app.options('*', cors(corsOptions));

// Rutas
app.use(router);

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