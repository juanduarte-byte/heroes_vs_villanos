import express from 'express'
import heroController from './controllers/heroController.js'
import villanoController from './controllers/villanoController.js'
import enfrentamientoController from './controllers/enfrentamientoController.js'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json'));

const app = express()


app.use(express.json())
app.use('/api', heroController)
app.use('/api', villanoController)
app.use('/api', enfrentamientoController)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const PORT = 3001
app.listen(PORT, _ => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})