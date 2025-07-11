import fs from 'fs-extra';
import path from 'path';

const BATALLAS_FILE = './data/batallas.json';

// Asegurar que el archivo existe
async function ensureFile() {
    try {
        await fs.ensureFile(BATALLAS_FILE);
        const content = await fs.readFile(BATALLAS_FILE, 'utf8');
        if (!content.trim()) {
            await fs.writeJson(BATALLAS_FILE, []);
        }
    } catch (error) {
        console.error('Error asegurando archivo de batallas:', error);
        await fs.writeJson(BATALLAS_FILE, []);
    }
}

export async function guardarBatalla(batalla) {
    try {
        await ensureFile();
        const batallas = await fs.readJson(BATALLAS_FILE);
        batallas.push(batalla.toJSON());
        await fs.writeJson(BATALLAS_FILE, batallas, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error guardando batalla:', error);
        return false;
    }
}

export async function obtenerTodasLasBatallas() {
    try {
        await ensureFile();
        const batallas = await fs.readJson(BATALLAS_FILE);
        return batallas;
    } catch (error) {
        console.error('Error obteniendo batallas:', error);
        return [];
    }
}

export async function obtenerBatallaPorId(id) {
    try {
        await ensureFile();
        const batallas = await fs.readJson(BATALLAS_FILE);
        return batallas.find(batalla => batalla.id === id);
    } catch (error) {
        console.error('Error obteniendo batalla por ID:', error);
        return null;
    }
}

export async function obtenerBatallasPorEstado(estado) {
    try {
        await ensureFile();
        const batallas = await fs.readJson(BATALLAS_FILE);
        return batallas.filter(batalla => batalla.estado === estado);
    } catch (error) {
        console.error('Error obteniendo batallas por estado:', error);
        return [];
    }
}

export async function obtenerBatallasPorGanador(ganador) {
    try {
        await ensureFile();
        const batallas = await fs.readJson(BATALLAS_FILE);
        return batallas.filter(batalla => batalla.ganador === ganador);
    } catch (error) {
        console.error('Error obteniendo batallas por ganador:', error);
        return [];
    }
}

export async function limpiarBatallasAntiguas(dias = 30) {
    try {
        await ensureFile();
        const batallas = await fs.readJson(BATALLAS_FILE);
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        
        const batallasFiltradas = batallas.filter(batalla => {
            const fechaBatalla = new Date(batalla.fecha);
            return fechaBatalla > fechaLimite;
        });
        
        await fs.writeJson(BATALLAS_FILE, batallasFiltradas, { spaces: 2 });
        return batallas.length - batallasFiltradas.length;
    } catch (error) {
        console.error('Error limpiando batallas antiguas:', error);
        return 0;
    }
}

export async function obtenerEstadisticas() {
    try {
        await ensureFile();
        const batallas = await fs.readJson(BATALLAS_FILE);
        
        const totalBatallas = batallas.length;
        const batallasFinalizadas = batallas.filter(b => b.estado === 'finalizada').length;
        const victoriasHeroes = batallas.filter(b => b.ganador === 'heroes').length;
        const victoriasVillanos = batallas.filter(b => b.ganador === 'villanos').length;
        const empates = batallas.filter(b => b.ganador === 'empate').length;
        
        return {
            totalBatallas,
            batallasFinalizadas,
            victoriasHeroes,
            victoriasVillanos,
            empates,
            porcentajeVictoriasHeroes: totalBatallas > 0 ? (victoriasHeroes / totalBatallas * 100).toFixed(2) : 0,
            porcentajeVictoriasVillanos: totalBatallas > 0 ? (victoriasVillanos / totalBatallas * 100).toFixed(2) : 0
        };
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return {
            totalBatallas: 0,
            batallasFinalizadas: 0,
            victoriasHeroes: 0,
            victoriasVillanos: 0,
            empates: 0,
            porcentajeVictoriasHeroes: 0,
            porcentajeVictoriasVillanos: 0
        };
    }
} 