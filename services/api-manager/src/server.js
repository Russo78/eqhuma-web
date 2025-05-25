// src/server.js
const app = require('./app');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('ERROR: Excepción no capturada. Cerrando servidor...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Variables de configuración
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});

// Manejo de rechazos de promesas no capturados
process.on('unhandledRejection', (err) => {
  console.error('ERROR: Rechazo de promesa no manejado. Cerrando servidor...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor de forma segura...');
  server.close(() => {
    console.log('Proceso terminado');
  });
});