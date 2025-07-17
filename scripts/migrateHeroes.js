import 'dotenv/config';
import Hero from '../models/heroModel.js';
import { connectDB } from '../config/db.js';

// Script para migrar datos existentes de JSON a MongoDB
const migrateHeroes = async () => {
    try {
        await connectDB();
        console.log('Conectado a MongoDB');

        // Datos de ejemplo (basados en tu archivo JSON)
        const heroesData = [
            {
                name: "Clark Kent",
                alias: "Superman",
                city: "Metropolis",
                team: "Justice League",
                powerLevel: 150,
                defenseLevel: 140
            },
            {
                name: "Tony Stark",
                alias: "Iron Man",
                city: "New York",
                team: "Avengers",
                powerLevel: 120,
                defenseLevel: 110
            },
            {
                name: "Bruce Wayne",
                alias: "Batman",
                city: "Gotham",
                team: "Justice League",
                powerLevel: 100,
                defenseLevel: 130
            }
        ];

        // Limpiar colección existente
        await Hero.deleteMany({});
        console.log('Colección de héroes limpiada');

        // Insertar héroes
        const heroes = await Hero.insertMany(heroesData);
        console.log(`${heroes.length} héroes migrados exitosamente`);

        console.log('Héroes creados:');
        heroes.forEach(hero => {
            console.log(`- ${hero.alias} (${hero.name}) - ID: ${hero._id}`);
        });

    } catch (error) {
        console.error('Error en la migración:', error);
    } finally {
        process.exit(0);
    }
};

migrateHeroes();
