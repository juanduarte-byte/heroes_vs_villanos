import 'dotenv/config';
import Villano from '../models/villanoModel.js';
import { connectDB } from '../config/db.js';

// Script para migrar datos existentes de JSON a MongoDB
const migrateVillanos = async () => {
    try {
        await connectDB();
        console.log('Conectado a MongoDB');

        // Datos de ejemplo (basados en tu archivo JSON)
        const villanosData = [
            {
                name: "Lex Luthor",
                alias: "Lex Luthor",
                city: "Metropolis",
                team: "Legion of Doom",
                powerLevel: 130,
                defenseLevel: 120
            },
            {
                name: "Thanos",
                alias: "Thanos",
                city: "Titan",
                team: "Black Order",
                powerLevel: 160,
                defenseLevel: 150
            },
            {
                name: "Oswald Cobblepot",
                alias: "El Pingüino",
                city: "Gotham",
                team: "Gotham Rogues",
                powerLevel: 90,
                defenseLevel: 100
            }
        ];

        // Limpiar colección existente
        await Villano.deleteMany({});
        console.log('Colección de villanos limpiada');

        // Insertar villanos
        const villanos = await Villano.insertMany(villanosData);
        console.log(`${villanos.length} villanos migrados exitosamente`);

        console.log('Villanos creados:');
        villanos.forEach(villano => {
            console.log(`- ${villano.alias} (${villano.name}) - ID: ${villano._id}`);
        });

    } catch (error) {
        console.error('Error en la migración:', error);
    } finally {
        process.exit(0);
    }
};

migrateVillanos();
