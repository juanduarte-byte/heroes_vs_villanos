import 'dotenv/config';
import Hero from '../models/heroModel.js';
import Villano from '../models/villanoModel.js';
import { connectDB } from '../config/db.js';

// Script para migrar todos los datos a MongoDB
const migrateAll = async () => {
    try {
        await connectDB();
        console.log('Conectado a MongoDB');

        // Datos de héroes
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

        // Datos de villanos
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

        // Limpiar colecciones existentes
        await Hero.deleteMany({});
        await Villano.deleteMany({});
        console.log('Colecciones limpiadas');

        // Insertar héroes
        const heroes = await Hero.insertMany(heroesData);
        console.log(`${heroes.length} héroes migrados exitosamente`);

        // Insertar villanos
        const villanos = await Villano.insertMany(villanosData);
        console.log(`${villanos.length} villanos migrados exitosamente`);

        console.log('\n=== HÉROES CREADOS ===');
        heroes.forEach(hero => {
            console.log(`- ${hero.alias} (${hero.name}) - ID: ${hero._id}`);
        });

        console.log('\n=== VILLANOS CREADOS ===');
        villanos.forEach(villano => {
            console.log(`- ${villano.alias} (${villano.name}) - ID: ${villano._id}`);
        });

        console.log('\n¡Migración completada exitosamente!');

    } catch (error) {
        console.error('Error en la migración:', error);
    } finally {
        process.exit(0);
    }
};

migrateAll();
