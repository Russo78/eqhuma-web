// src/utils/db.js
const mongoose = require('mongoose');

/**
 * Función para conectar a la base de datos MongoDB
 * Configurada para manejar tanto la conexión inicial como reintentos
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
    
    // Configurar eventos de conexión para manejar errores y reconexión
    mongoose.connection.on('error', err => {
      console.error(`Error en la conexión a MongoDB: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado. Intentando reconectar...');
      setTimeout(connectDB, 5000); // Reintentar cada 5 segundos
    });
    
    return conn;
  } catch (err) {
    console.error(`Error al conectar a MongoDB: ${err.message}`);
    // En entorno de producción, es mejor reintentar la conexión
    if (process.env.NODE_ENV === 'production') {
      console.log('Intentando reconectar en 5 segundos...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;