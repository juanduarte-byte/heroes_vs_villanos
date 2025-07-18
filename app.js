import 'dotenv/config';
import express from 'express';
import heroController from './controllers/heroController.js';
import villanoController from './controllers/villanoController.js';
import enfrentamientoController from './controllers/enfrentamientoController.js';
import batallaController from './controllers/batallaController.js';
import authController from './controllers/authController.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { connectDB } from './config/db.js';

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json'));
const app = express();

// Middleware de logging para monitorear peticiones
app.use((req, res, next) => {
  console.log('\n🔍 === PETICIÓN DETECTADA ===');
  console.log(`📍 Método: ${req.method}`);
  console.log(`🌐 URL: ${req.url}`);
  console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
  
  // Mostrar headers de autorización
  if (req.headers.authorization) {
    console.log(`🔑 Authorization Header: ${req.headers.authorization.substring(0, 50)}...`);
  } else {
    console.log(`❌ NO HAY Authorization Header`);
  }
  
  // Mostrar otros headers importantes
  console.log(`📋 Content-Type: ${req.headers['content-type'] || 'No especificado'}`);
  console.log(`🖥️ User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'No especificado'}...`);
  
  // SOLUCIÓN TEMPORAL: Para endpoints de batalla, usar el último token válido si no hay header
  if (req.url.includes('/api/batallas/') && !req.headers.authorization) {
    // Solo para testing - en producción esto no se haría
    console.log('🔧 APLICANDO SOLUCIÓN TEMPORAL PARA TESTING');
    // Podrías poner aquí un token de prueba si tienes uno
  }
  
  next();
});

app.use(express.json());

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: "🦸‍♂️ API Heroes vs Villanos funcionando correctamente ⚔️",
    version: "1.0.0",
    status: "En línea",
    endpoints: {
      autenticacion: [
        "POST /api/auth/register - Registrar nuevo usuario",
        "POST /api/auth/login - Iniciar sesión",
        "GET /api/auth/profile - Obtener perfil (requiere token)"
      ],
      personajes: [
        "GET /api/heroes - Listar todos los héroes",
        "GET /api/villanos - Listar todos los villanos"
      ],
      batallas: [
        "GET /api/batallas - Ver batallas del usuario autenticado",
        "POST /api/batallas - Crear nueva batalla"
      ]
    },
    documentacion: process.env.NODE_ENV !== 'production' ? 
      "Swagger UI disponible en /api-docs" : 
      "Swagger UI deshabilitado en producción",
    autor: "Juan Duarte",
    repositorio: "https://github.com/juanduarte-byte/heroes_vs_villanos"
  });
});

app.use('/api', heroController);
app.use('/api', villanoController);
app.use('/api', enfrentamientoController);
app.use('/api/batallas', batallaController);
app.use('/api/auth', authController);
// Configuración de Swagger para producción
const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: process.env.NODE_ENV !== 'production',
    requestInterceptor: (req) => {
      // Asegurar que Authorization header se incluya
      const authHeader = req.url.includes('/api/batallas/') ? 
        req.headers.Authorization || req.headers.authorization : 
        req.headers.Authorization || req.headers.authorization;
      
      if (authHeader && !req.headers.Authorization) {
        req.headers.Authorization = authHeader;
      }
      return req;
    }
  }
};

// Solo mostrar Swagger en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  console.log(`📚 Swagger UI disponible en: http://localhost:${PORT}/api-docs`);
} else {
  console.log('🔒 Swagger UI deshabilitado en producción');
}

const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});