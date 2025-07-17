import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno si no están ya cargadas
if (!process.env.MONGODB_URI) {
    dotenv.config();
}

const uri = process.env.MONGODB_URI;

export const connectDB = () => {
    if (!uri) {
        throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }
    
    return mongoose.connect(uri);
};
