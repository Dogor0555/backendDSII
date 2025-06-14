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

// Configuración optimizada de CORS para trabajar con localStorage
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://frontproyectobdsii.vercel.app',
      'http://localhost:3000'
    ];
    
    // Permitir solicitudes sin origen (como apps móviles o Postman) en desarrollo
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cachear configuración CORS por 24 horas
};

app.use(cors(corsOptions));

// Manejador explícito para OPTIONS (preflight)
app.options('*', cors(corsOptions));

// Middleware para loggear solicitudes (útil para debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Rutas
app.use(router);

// Manejo de errores mejorado
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  
  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ 
      mensaje: 'Acceso prohibido',
      detalle: 'Origen no autorizado'
    });
  }

  res.status(500).json({ 
    mensaje: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000; // Con valor por defecto para desarrollo

app.listen(PORT, () => {
  console.log(`\n=== Servidor iniciado ===`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Puerto: ${PORT}`);
  console.log(`Hora: ${new Date().toLocaleString()}`);
  console.log(`Orígenes permitidos:`);
  corsOptions.origin.forEach(origin => console.log(`- ${origin}`));
  console.log(`========================\n`);
});

// Conectar a la base de datos
connection();