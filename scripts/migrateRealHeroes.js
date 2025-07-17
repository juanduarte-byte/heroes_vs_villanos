import 'dotenv/config';
import Hero from '../models/heroModel.js';
import fs from 'fs';
import { connectDB } from '../config/db.js';

// Script para migrar todos los héroes reales desde el archivo JSON
const migrateRealHeroes = async () => {
    try {
        await connectDB();
        console.log('Conectado a MongoDB');

        // Leer el archivo JSON original
        const heroesData = JSON.parse(fs.readFileSync('./data/superheroes.json', 'utf-8'));
        
        // Transformar los datos al formato de MongoDB
        const heroesForMongo = heroesData.map(hero => ({
            name: hero.name,
            alias: hero.alias,
            city: hero.city,
            team: hero.team,
            powerLevel: 100, // Valor por defecto
            defenseLevel: 100 // Valor por defecto
        }));

        // Limpiar colección existente
        await Hero.deleteMany({});
        console.log('Colección de héroes limpiada');

        // Insertar todos los héroes
        const heroes = await Hero.insertMany(heroesForMongo);
        console.log(`${heroes.length} héroes migrados exitosamente`);

        console.log('Primeros 10 héroes creados:');
        heroes.slice(0, 10).forEach((hero, index) => {
            console.log(`${index + 1}. ${hero.alias} (${hero.name}) - ${hero.city}`);
        });

        console.log(`\n... y ${heroes.length - 10} más.`);
        console.log(`\nTotal: ${heroes.length} héroes en MongoDB`);

    } catch (error) {
        console.error('Error en la migración:', error);
    } finally {
        process.exit(0);
    }
};

migrateRealHeroes();
