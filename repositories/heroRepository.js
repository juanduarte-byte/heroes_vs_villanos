import Hero from '../models/heroModel.js';

async function getHeroes() {
    try {
        return await Hero.find();
    } catch (error) {
        console.error('Error al obtener héroes:', error);
        throw error;
    }
}

async function saveHeroes(heroes) {
    try {
        // Este método es para compatibilidad, pero en MongoDB creamos/actualizamos individualmente
        return await Hero.insertMany(heroes);
    } catch (error) {
        console.error('Error al guardar héroes:', error);
        throw error;
    }
}

async function getHeroeById(id) {
    try {
        return await Hero.findById(id);
    } catch (error) {
        console.error('Error al obtener héroe por ID:', error);
        throw error;
    }
}

async function createHeroe(heroData) {
    try {
        const hero = new Hero(heroData);
        return await hero.save();
    } catch (error) {
        console.error('Error al crear héroe:', error);
        throw error;
    }
}

async function updateHeroe(id, updates) {
    try {
        return await Hero.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
        console.error('Error al actualizar héroe:', error);
        throw error;
    }
}

async function deleteHeroe(id) {
    try {
        return await Hero.findByIdAndDelete(id);
    } catch (error) {
        console.error('Error al eliminar héroe:', error);
        throw error;
    }
}

export default {
    getHeroes,
    saveHeroes,
    getHeroeById,
    createHeroe,
    updateHeroe,
    deleteHeroe
};