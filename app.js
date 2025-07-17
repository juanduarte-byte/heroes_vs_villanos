
import 'dotenv/config';
import express from 'express';
import heroController from './controllers/heroController.js';
import villanoController from './controllers/villanoController.js';
import enfrentamientoController from './controllers/enfrentamientoController.js';
import batallaController from './controllers/batallaController.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { connectDB } from './config/db.js';

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json'));
const app = express();

app.use(express.json());
app.use('/api', heroController);
app.use('/api', villanoController);
app.use('/api', enfrentamientoController);
app.use('/api/batallas', batallaController);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});