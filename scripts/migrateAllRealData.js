import 'dotenv/config';
import Hero from '../models/heroModel.js';
import Villano from '../models/villanoModel.js';
import fs from 'fs';
import { connectDB } from '../config/db.js';

// Script para migrar TODOS los datos reales desde los archivos JSON
const migrateAllRealData = async () => {
    try {
        await connectDB();
        console.log('Conectado a MongoDB');

        // Leer los archivos JSON originales
        const heroesData = JSON.parse(fs.readFileSync('./data/superheroes.json', 'utf-8'));
        const villanosData = JSON.parse(fs.readFileSync('./data/villanos.json', 'utf-8'));
        
        // Transformar héroes al formato de MongoDB
        const heroesForMongo = heroesData.map(hero => ({
            name: hero.name,
            alias: hero.alias,
            city: hero.city,
            team: hero.team,
            powerLevel: 100, // Valor por defecto
            defenseLevel: 100 // Valor por defecto
        }));

        // Transformar villanos al formato de MongoDB
        const villanosForMongo = villanosData.map(villano => ({
            name: villano.name,
            alias: villano.alias,
            city: villano.city,
            team: villano.team,
            powerLevel: 100, // Valor por defecto
            defenseLevel: 100 // Valor por defecto
        }));

        // Limpiar colecciones existentes
        await Hero.deleteMany({});
        await Villano.deleteMany({});
        console.log('Colecciones limpiadas');

        // Insertar todos los héroes
        const heroes = await Hero.insertMany(heroesForMongo);
        console.log(`${heroes.length} héroes migrados exitosamente`);

        // Insertar todos los villanos
        const villanos = await Villano.insertMany(villanosForMongo);
        console.log(`${villanos.length} villanos migrados exitosamente`);

        console.log('\n=== RESUMEN DE MIGRACIÓN ===');
        console.log(`✅ Héroes: ${heroes.length}`);
        console.log(`✅ Villanos: ${villanos.length}`);
        console.log(`✅ Total: ${heroes.length + villanos.length} personajes`);

        console.log('\n=== ALGUNOS HÉROES MIGRADOS ===');
        heroes.slice(0, 5).forEach((hero, index) => {
            console.log(`${index + 1}. ${hero.alias} (${hero.name}) - ${hero.city}`);
        });

        console.log('\n=== ALGUNOS VILLANOS MIGRADOS ===');
        villanos.slice(0, 3).forEach((villano, index) => {
            console.log(`${index + 1}. ${villano.alias} (${villano.name}) - ${villano.city}`);
        });

        console.log('\n¡Migración completa de todos los datos reales!');

    } catch (error) {
        console.error('Error en la migración:', error);
    } finally {
        process.exit(0);
    }
};

migrateAllRealData();
