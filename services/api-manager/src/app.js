// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Cargar variables de entorno
dotenv.config();

// Importar el manejador de errores y la conexión a la base de datos
const errorHandler = require('./middleware/error');
const connectDB = require('./utils/db');

// Inicializar la aplicación Express
const app = express();

// Middlewares de seguridad
// Configurar Helmet para seguridad de cabeceras HTTP
app.use(helmet());
// Prevenir ataques XSS (cross-site scripting)
app.use(xss());
// Limitar las peticiones para prevenir ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 100 // limitar cada IP a 100 peticiones por ventana
});
app.use(limiter);
// Prevenir la polución de parámetros HTTP
app.use(hpp());
// Sanitizar los datos de entrada (prevenir inyección NoSQL)
app.use(mongoSanitize());

// Configuración de CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());

// Middleware de logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Conectar a la base de datos
connectDB();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const apiInstanceRoutes = require('./routes/apiInstanceRoutes');
const apiClickTrackingRoutes = require('./routes/apiClickTrackingRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const crmRoutes = require('./routes/crmRoutes');

// Montar las rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/api-instances', apiInstanceRoutes);
app.use('/api/v1/api-tracking', apiClickTrackingRoutes);
app.use('/api/v1/marketing', marketingRoutes);
app.use('/api/v1/crm', crmRoutes);

// Ruta de bienvenida / estado de la API
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EQHuma API Manager está funcionando correctamente',
    environment: process.env.NODE_ENV,
    apiVersion: 'v1'
  });
});

// Ruta para verificar estado de salud del servidor
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;