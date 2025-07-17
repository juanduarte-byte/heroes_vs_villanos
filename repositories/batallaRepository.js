import Batalla from '../models/batallaModelMongoDB.js';
import { BatallaEquipo, EquipoBatalla } from '../models/batallaModel.js';

export async function guardarBatalla(batalla) {
    try {
        // Convertir clase a datos MongoDB
        const batallaData = batalla.toJSON();
        const nuevaBatalla = new Batalla(batallaData);
        const batallaGuardada = await nuevaBatalla.save();
        return batallaGuardada;
    } catch (error) {
        console.error('Error guardando batalla:', error);
        throw error;
    }
}

export async function obtenerBatallaPorId(id) {
    try {
        const batallaData = await Batalla.findById(id);
        if (!batallaData) return null;
        
        // Convertir datos MongoDB a clase con lógica de negocio
        return reconstructBatallaFromData(batallaData);
    } catch (error) {
        console.error('Error obteniendo batalla por ID:', error);
        return null;
    }
}

export async function obtenerBatallaActivaPorId(id) {
    try {
        const batallaData = await Batalla.findById(id);
        if (!batallaData || batallaData.estado === 'finalizada') return null;
        
        // Reconstruir clase con lógica de negocio para batallas activas
        return reconstructBatallaFromData(batallaData);
    } catch (error) {
        console.error('Error obteniendo batalla activa:', error);
        return null;
    }
}

export async function actualizarBatalla(batalla) {
    try {
        const batallaData = batalla.toJSON();
        const batallaActualizada = await Batalla.findByIdAndUpdate(
            batallaData._id || batallaData.id,
            batallaData,
            { new: true, runValidators: true }
        );
        return batallaActualizada;
    } catch (error) {
        console.error('Error actualizando batalla:', error);
        throw error;
    }
}

// Función helper para reconstruir clase desde datos MongoDB
function reconstructBatallaFromData(data) {
    try {
        // Reconstruir equipos
        const equipoHeroes = new EquipoBatalla(
            data.equipoHeroes.personajes,
            data.equipoHeroes.nombreEquipo,
            true
        );
        equipoHeroes.personajeActual = data.equipoHeroes.personajeActual;
        
        const equipoVillanos = new EquipoBatalla(
            data.equipoVillanos.personajes,
            data.equipoVillanos.nombreEquipo,
            false
        );
        equipoVillanos.personajeActual = data.equipoVillanos.personajeActual;
        
        // Reconstruir batalla
        const batalla = new BatallaEquipo(
            equipoHeroes,
            equipoVillanos,
            data.iniciador
        );
        
        // Restaurar estado
        batalla.id = data._id.toString();
        batalla.ronda = data.ronda;
        batalla.turno = data.turno;
        batalla.estado = data.estado;
        batalla.ganador = data.ganador;
        batalla.fecha = data.fecha;
        batalla.historial = data.historial;
        
        return batalla;
    } catch (error) {
        console.error('Error reconstruyendo batalla:', error);
        return null;
    }
}

export async function obtenerBatallasPorEstado(estado) {
    try {
        const batallas = await Batalla.find({ estado }).sort({ fecha: -1 });
        return batallas;
    } catch (error) {
        console.error('Error obteniendo batallas por estado:', error);
        return [];
    }
}

export async function obtenerBatallasPorGanador(ganador) {
    try {
        const batallas = await Batalla.find({ ganador }).sort({ fecha: -1 });
        return batallas;
    } catch (error) {
        console.error('Error obteniendo batallas por ganador:', error);
        return [];
    }
}

export async function eliminarBatalla(id) {
    try {
        const resultado = await Batalla.findByIdAndDelete(id);
        return resultado;
    } catch (error) {
        console.error('Error eliminando batalla:', error);
        throw error;
    }
}

export async function limpiarBatallasAntiguas(dias = 30) {
    try {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        
        const resultado = await Batalla.deleteMany({ 
            fecha: { $lt: fechaLimite } 
        });
        
        return resultado.deletedCount;
    } catch (error) {
        console.error('Error limpiando batallas antiguas:', error);
        return 0;
    }
}

export async function obtenerEstadisticas() {
    try {
        const estadisticas = await Batalla.obtenerEstadisticas();
        return estadisticas;
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return {
            totalBatallas: 0,
            porGanador: [],
            porMes: []
        };
    }
}

export async function obtenerBatallasPorPersonaje(personajeAlias) {
    try {
        const batallas = await Batalla.find({
            $or: [
                { 'equipoHeroes.personajes.alias': personajeAlias },
                { 'equipoVillanos.personajes.alias': personajeAlias }
            ]
        }).sort({ fecha: -1 });
        return batallas;
    } catch (error) {
        console.error('Error obteniendo batallas por personaje:', error);
        return [];
    }
}

export async function obtenerBatallasRecientes(limite = 10) {
    try {
        const batallas = await Batalla.find()
            .sort({ fecha: -1 })
            .limit(limite);
        return batallas;
    } catch (error) {
        console.error('Error obteniendo batallas recientes:', error);
        return [];
    }
}

export async function obtenerBatallasPorRango(fechaInicio, fechaFin) {
    try {
        const batallas = await Batalla.find({
            fecha: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        }).sort({ fecha: -1 });
        return batallas;
    } catch (error) {
        console.error('Error obteniendo batallas por rango:', error);
        return [];
    }
}

export async function obtenerTodasLasBatallas() {
    try {
        const batallas = await Batalla.find().sort({ fecha: -1 });
        return batallas;
    } catch (error) {
        console.error('Error obteniendo todas las batallas:', error);
        return [];
    }
}