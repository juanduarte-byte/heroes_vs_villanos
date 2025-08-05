import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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

// Configuración de CORS para permitir frontend local y desarrollo
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como aplicaciones móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://127.0.0.1:5500', 
      'http://localhost:5500',
      'http://127.0.0.1:8080', 
      'http://localhost:8080',
      'http://127.0.0.1:3000', 
      'http://localhost:3000',
      'http://127.0.0.1:8000', 
      'http://localhost:8000'
    ];
    
    // En desarrollo, también permitir cualquier localhost
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS bloqueó origen: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

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

// Endpoint de salud (health check)
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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
        "GET /api/auth/profile - Obtener perfil (requiere token)",
        "PUT /api/auth/profile - Actualizar perfil (requiere token)",
        "POST /api/auth/logout - Cerrar sesión (requiere token)"
      ],
      personajes: [
        "GET /api/heroes - Listar todos los héroes",
        "GET /api/villanos - Listar todos los villanos"
      ],
      batallas: [
        "POST /api/batallas/crear - Crear nueva batalla (requiere token)",
        "POST /api/batallas/:id/iniciar - Iniciar batalla (requiere token)",
        "POST /api/batallas/:id/atacar - Realizar ataque (requiere token)",
        "POST /api/batallas/:id/activar-superataque - Activar superataque (requiere token)",
        "POST /api/batallas/:id/activar-superdefensa - Activar superdefensa (requiere token)",
        "POST /api/batallas/:id/usar-habilidad - Usar habilidad especial (requiere token)",
        "GET /api/batallas/:id/info - Información de batalla (requiere token)",
        "GET /api/batallas/:id/estado - Estado de batalla (requiere token)",
        "GET /api/batallas/activas - Batallas activas del usuario (requiere token)",
        "GET /api/batallas/historial - Historial de batallas (requiere token)",
        "GET /api/batallas/estadisticas - Estadísticas generales",
        "POST /api/batallas/simular - Simular batalla completa",
        "POST /api/batallas/probar - Probar sistema de batallas"
      ],
      enfrentamientos: [
        "GET /api/enfrentamientos - Listar enfrentamientos",
        "POST /api/heroes/:id/enfrentar - Enfrentar desde héroe",
        "POST /api/villanos/:id/enfrentar - Enfrentar desde villano"
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

const PORT = process.env.PORT || 3001;

// Solo mostrar Swagger en desarrollo (permitir en producción para testing)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  console.log(`📚 Swagger UI disponible en: http://localhost:${PORT}/api-docs`);
} else {
  console.log('🔒 Swagger UI deshabilitado en producción');
}
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});