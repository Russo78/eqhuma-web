// src/tests/crmTest.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/User');
const Prospect = require('../models/Prospect');
const ProspectSegment = require('../models/ProspectSegment');

// Cargar variables de entorno
dotenv.config();

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`.cyan.bold);
    return conn;
  } catch (err) {
    console.error(`Error al conectar a MongoDB: ${err.message}`.red.bold);
    process.exit(1);
  }
};

// Función para limpiar los datos
const clearData = async () => {
  try {
    await Prospect.deleteMany({ email: { $regex: '@test.com$' } });
    await ProspectSegment.deleteMany({ name: { $regex: '^Test' } });
    console.log('Datos de prueba eliminados correctamente'.yellow.bold);
  } catch (error) {
    console.error(`Error al limpiar datos: ${error.message}`.red.bold);
  }
};

// Datos de prueba
const createTestUser = async () => {
  try {
    // Verificar si ya existe un usuario de prueba
    let user = await User.findOne({ email: 'admin@eqhuma.com' });
    
    if (!user) {
      // Crear un usuario administrador de prueba
      user = await User.create({
        name: 'Admin Test',
        email: 'admin@eqhuma.com',
        password: 'password123', // en un caso real usar bcrypt
        role: 'admin'
      });
      console.log('Usuario de prueba creado'.green.bold);
    }

    return user;
  } catch (error) {
    console.error(`Error al crear usuario de prueba: ${error.message}`.red.bold);
    throw error;
  }
};

// Crear prospectos de prueba
const createTestProspects = async (userId) => {
  try {
    const prospects = [
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@test.com',
        phone: '5551234567',
        company: 'Empresa A',
        position: 'Gerente',
        status: 'new',
        segment: 'small_business',
        source: 'web',
        score: 70,
        tags: ['interesado', 'webinar'],
        owner: userId
      },
      {
        firstName: 'María',
        lastName: 'López',
        email: 'maria@test.com',
        phone: '5559876543',
        company: 'Empresa B',
        position: 'Directora',
        status: 'qualified',
        segment: 'mid_market',
        source: 'event',
        score: 85,
        tags: ['oportunidad', 'seguimiento'],
        owner: userId
      },
      {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos@test.com',
        phone: '5552468135',
        company: 'Empresa C',
        position: 'Coordinador',
        status: 'contacted',
        segment: 'small_business',
        source: 'referral',
        score: 60,
        tags: ['nuevo', 'referido'],
        owner: userId
      },
      {
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'ana@test.com',
        phone: '5553698521',
        company: 'Empresa D',
        position: 'CEO',
        status: 'proposal',
        segment: 'enterprise',
        source: 'web',
        score: 90,
        tags: ['importante', 'urgente'],
        owner: userId
      },
      {
        firstName: 'Roberto',
        lastName: 'Gómez',
        email: 'roberto@test.com',
        phone: '5557412589',
        company: 'Empresa E',
        position: 'Analista',
        status: 'new',
        segment: 'individual',
        source: 'social_media',
        score: 40,
        tags: ['prospecto', 'redes'],
        owner: userId
      }
    ];

    const createdProspects = await Prospect.insertMany(prospects);
    console.log(`${createdProspects.length} prospectos de prueba creados`.green.bold);
    return createdProspects;
  } catch (error) {
    console.error(`Error al crear prospectos de prueba: ${error.message}`.red.bold);
    throw error;
  }
};

// Crear segmentos de prueba
const createTestSegments = async (userId) => {
  try {
    const segments = [
      {
        name: 'Test - Prospectos nuevos',
        description: 'Segmento para prospectos recién creados',
        criteria: {
          status: ['new'],
          minScore: 30
        },
        isPublic: true,
        tags: ['nuevo', 'seguimiento'],
        color: '#2ecc71',
        owner: userId,
        createdBy: userId
      },
      {
        name: 'Test - Oportunidades calificadas',
        description: 'Prospectos con alta probabilidad de conversión',
        criteria: {
          status: ['qualified', 'proposal', 'negotiation'],
          minScore: 70
        },
        isPublic: false,
        tags: ['calificado', 'oportunidad'],
        color: '#3498db',
        owner: userId,
        createdBy: userId
      },
      {
        name: 'Test - Empresas medianas y grandes',
        description: 'Segmento para empresas medianas y grandes',
        criteria: {
          segment: ['mid_market', 'enterprise'],
          minScore: 50
        },
        isPublic: true,
        tags: ['empresa', 'b2b'],
        color: '#9b59b6',
        owner: userId,
        createdBy: userId
      }
    ];

    const createdSegments = await ProspectSegment.insertMany(segments);
    console.log(`${createdSegments.length} segmentos de prueba creados`.green.bold);
    
    // Actualizar estadísticas de los segmentos
    for (const segment of createdSegments) {
      await segment.updateStats();
    }
    console.log('Estadísticas de segmentos actualizadas'.green.bold);
    
    return createdSegments;
  } catch (error) {
    console.error(`Error al crear segmentos de prueba: ${error.message}`.red.bold);
    throw error;
  }
};

// Función principal para ejecutar el test
const runTest = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Limpiar datos previos de prueba
    await clearData();
    
    // Crear usuario de prueba
    const user = await createTestUser();
    
    // Crear prospectos de prueba
    const prospects = await createTestProspects(user._id);
    
    // Crear segmentos de prueba
    const segments = await createTestSegments(user._id);
    
    // Mostrar algunos resultados
    console.log('\n----- RESULTADOS DEL TEST -----'.magenta.bold);
    
    // Consultar un segmento con sus estadísticas
    const testSegment = await ProspectSegment.findById(segments[0]._id);
    console.log('\nSegmento:'.cyan.bold);
    console.log({
      name: testSegment.name,
      description: testSegment.description,
      stats: testSegment.stats
    });
    
    // Consultar prospectos que coinciden con el segmento
    const query = testSegment.buildQuery();
    const matchingProspects = await Prospect.find(query).select('firstName lastName email status score');
    console.log('\nProspectos que coinciden con el segmento:'.cyan.bold);
    console.log(matchingProspects.map(p => ({
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      status: p.status,
      score: p.score
    })));
    
    console.log('\nTest CRM completado exitosamente'.green.bold);
    process.exit(0);
  } catch (error) {
    console.error(`Error en el test: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Ejecutar el test
runTest();