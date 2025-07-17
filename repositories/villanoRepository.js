import Villano from '../models/villanoModel.js';

async function getVillanos() {
    try {
        return await Villano.find();
    } catch (error) {
        console.error('Error al obtener villanos:', error);
        throw error;
    }
}

async function saveVillanos(villanos) {
    try {
        // Este método es para compatibilidad, pero en MongoDB creamos/actualizamos individualmente
        return await Villano.insertMany(villanos);
    } catch (error) {
        console.error('Error al guardar villanos:', error);
        throw error;
    }
}

async function getVillanoById(id) {
    try {
        return await Villano.findById(id);
    } catch (error) {
        console.error('Error al obtener villano por ID:', error);
        throw error;
    }
}

async function createVillano(villanoData) {
    try {
        const villano = new Villano(villanoData);
        return await villano.save();
    } catch (error) {
        console.error('Error al crear villano:', error);
        throw error;
    }
}

async function updateVillano(id, updates) {
    try {
        return await Villano.findByIdAndUpdate(id, updates, { new: true });
    } catch (error) {
        console.error('Error al actualizar villano:', error);
        throw error;
    }
}

async function deleteVillano(id) {
    try {
        return await Villano.findByIdAndDelete(id);
    } catch (error) {
        console.error('Error al eliminar villano:', error);
        throw error;
    }
}

export default {
    getVillanos,
    saveVillanos,
    getVillanoById,
    createVillano,
    updateVillano,
    deleteVillano
};
