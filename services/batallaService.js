export async function activarSuperAtaque(batallaId, personajeId) {
    try {
        const batalla = batallasActivas.get(batallaId);
        if (!batalla) {
            throw new Error('Batalla no encontrada o ya finalizada');
        }
        let personaje = null;
        if (personajeId.startsWith('H')) {
            personaje = batalla.equipoHeroes.personajes.find(p => p.idUnico === personajeId);
        } else if (personajeId.startsWith('V')) {
            personaje = batalla.equipoVillanos.personajes.find(p => p.idUnico === personajeId);
        }
        if (!personaje) {
            throw new Error('Personaje no encontrado en la batalla');
        }
        if (!personaje.puedeUsarSuperAtaque()) {
            throw new Error('La barra de poder no está llena');
        }
        personaje.activarSuperAtaque();
        return { success: true, mensaje: 'Superataque activado para ' + personaje.alias, personaje };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function activarSuperDefensa(batallaId, personajeId) {
    try {
        const batalla = batallasActivas.get(batallaId);
        if (!batalla) {
            throw new Error('Batalla no encontrada o ya finalizada');
        }
        let personaje = null;
        if (personajeId.startsWith('H')) {
            personaje = batalla.equipoHeroes.personajes.find(p => p.idUnico === personajeId);
        } else if (personajeId.startsWith('V')) {
            personaje = batalla.equipoVillanos.personajes.find(p => p.idUnico === personajeId);
        }
        if (!personaje) {
            throw new Error('Personaje no encontrado en la batalla');
        }
        if (!personaje.puedeUsarSuperDefensa()) {
            throw new Error('La barra de defensa no está llena');
        }
        personaje.activarSuperDefensa();
        return { success: true, mensaje: 'Superdefensa activada para ' + personaje.alias, personaje };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
import { BatallaEquipo, EquipoBatalla } from '../models/batallaModel.js';
import { guardarBatalla, obtenerTodasLasBatallas, obtenerBatallaPorId, obtenerEstadisticas } from '../repositories/batallaRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villanoRepository from '../repositories/villanoRepository.js';

// Almacenamiento en memoria para batallas activas
const batallasActivas = new Map();

// Función para crear ID único que combine tipo y ID numérico
function crearIdUnico(tipo, idNumerico) {
    return `${tipo}${idNumerico}`;
}

// Función para extraer información del ID único
function parsearIdUnico(idUnico) {
    const tipo = idUnico.charAt(0);
    const idNumerico = parseInt(idUnico.substring(1));
    return { tipo, idNumerico };
}

export async function crearBatalla(equipoHeroes, equipoVillanos, iniciador = 'heroes', primerHeroe = null, primerVillano = null) {
    try {
        // Validar que tenemos exactamente 3 héroes y 3 villanos
        if (!equipoHeroes || equipoHeroes.length !== 3) {
            throw new Error('Se requieren exactamente 3 héroes para la batalla');
        }
        
        if (!equipoVillanos || equipoVillanos.length !== 3) {
            throw new Error('Se requieren exactamente 3 villanos para la batalla');
        }

        // Validar que todos los personajes existen y crear IDs únicos
        const heroesValidados = [];
        const villanosValidados = [];

        for (const heroeId of equipoHeroes) {
            const heroe = await heroRepository.getHeroeById(heroeId);
            if (!heroe) {
                throw new Error(`Héroe con ID ${heroeId} no encontrado`);
            }
            // Crear ID único para el héroe
            heroe.idUnico = crearIdUnico('H', heroe.id);
            heroesValidados.push(heroe);
        }

        for (const villanoId of equipoVillanos) {
            const villano = await villanoRepository.getVillanoById(villanoId);
            if (!villano) {
                throw new Error(`Villano con ID ${villanoId} no encontrado`);
            }
            // Crear ID único para el villano
            villano.idUnico = crearIdUnico('V', villano.id);
            villanosValidados.push(villano);
        }

        // Validar personajes iniciales si se especifican
        if (primerHeroe && !equipoHeroes.includes(primerHeroe)) {
            throw new Error(`El héroe inicial ${primerHeroe} no está en el equipo seleccionado`);
        }
        
        if (primerVillano && !equipoVillanos.includes(primerVillano)) {
            throw new Error(`El villano inicial ${primerVillano} no está en el equipo seleccionado`);
        }

        // Crear equipos
        const equipoHeroesBatalla = new EquipoBatalla(heroesValidados, 'Equipo de Héroes', true);
        const equipoVillanosBatalla = new EquipoBatalla(villanosValidados, 'Equipo de Villanos', false);

        // Crear batalla con personajes iniciales
        const batalla = new BatallaEquipo(equipoHeroesBatalla, equipoVillanosBatalla, iniciador, primerHeroe, primerVillano);
        
        // Guardar en memoria para batallas activas
        batallasActivas.set(batalla.id, batalla);

        return {
            success: true,
            batalla: batalla.getEstadoActual(),
            mensaje: 'Batalla creada exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function iniciarBatalla(batallaId) {
    try {
        const batalla = batallasActivas.get(batallaId);
        if (!batalla) {
            throw new Error('Batalla no encontrada o ya finalizada');
        }

        if (batalla.estado !== 'iniciando') {
            throw new Error('La batalla ya ha sido iniciada');
        }

        batalla.iniciarBatalla();

        return {
            success: true,
            batalla: batalla.getEstadoActual(),
            mensaje: 'Batalla iniciada'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function realizarAtaque(batallaId, atacanteId, objetivoId, tipoAtaque) {
    try {
        const batalla = batallasActivas.get(batallaId);
        if (!batalla) {
            throw new Error('Batalla no encontrada o ya finalizada');
        }

        if (batalla.estado !== 'en_curso') {
            throw new Error('La batalla no está en curso');
        }

        // Debug: Mostrar estado antes del ataque
        console.log('DEBUG - Estado antes del ataque:', {
            batallaId,
            estado: batalla.estado,
            turno: batalla.turno,
            ronda: batalla.ronda,
            heroesVivos: batalla.equipoHeroes.getPersonajesVivos().length,
            villanosVivos: batalla.equipoVillanos.getPersonajesVivos().length
        });

        // Parsear IDs únicos para encontrar atacante y objetivo
        let atacante = null;
        let objetivo = null;

        // Buscar atacante
        if (atacanteId.startsWith('H')) {
            atacante = batalla.equipoHeroes.personajes.find(p => p.idUnico === atacanteId);
        } else if (atacanteId.startsWith('V')) {
            atacante = batalla.equipoVillanos.personajes.find(p => p.idUnico === atacanteId);
        } else {
            // Fallback para IDs numéricos (compatibilidad)
            atacante = batalla.equipoHeroes.personajes.find(p => p.id === parseInt(atacanteId)) ||
                      batalla.equipoVillanos.personajes.find(p => p.id === parseInt(atacanteId));
        }

        // Buscar objetivo
        if (objetivoId.startsWith('H')) {
            objetivo = batalla.equipoHeroes.personajes.find(p => p.idUnico === objetivoId);
        } else if (objetivoId.startsWith('V')) {
            objetivo = batalla.equipoVillanos.personajes.find(p => p.idUnico === objetivoId);
        } else {
            // Fallback para IDs numéricos (compatibilidad)
            objetivo = batalla.equipoHeroes.personajes.find(p => p.id === parseInt(objetivoId)) ||
                      batalla.equipoVillanos.personajes.find(p => p.id === parseInt(objetivoId));
        }

        // Debug: Mostrar información de búsqueda
        console.log('DEBUG - Búsqueda:', {
            atacanteId,
            objetivoId,
            atacanteEncontrado: atacante ? {
                id: atacante.id,
                idUnico: atacante.idUnico,
                alias: atacante.alias,
                esHeroe: atacante.esHeroe,
                vida: atacante.vida
            } : null,
            objetivoEncontrado: objetivo ? {
                id: objetivo.id,
                idUnico: objetivo.idUnico,
                alias: objetivo.alias,
                esHeroe: objetivo.esHeroe,
                vida: objetivo.vida
            } : null
        });

        if (!atacante) {
            throw new Error(`Atacante con ID ${atacanteId} no encontrado. Verifica que el ID corresponda al equipo correcto.`);
        }

        if (!objetivo) {
            throw new Error(`Objetivo con ID ${objetivoId} no encontrado. Verifica que el ID corresponda al equipo correcto.`);
        }

        // Verificar que atacante y objetivo sean de equipos diferentes
        if (atacante.esHeroe === objetivo.esHeroe) {
            const equipo = atacante.esHeroe ? 'héroes' : 'villanos';
            throw new Error(`Solo puedes atacar a personajes del equipo contrario. Ambos personajes son del equipo de ${equipo}. Atacante: ${atacante.alias} (${atacante.esHeroe ? 'héroe' : 'villano'}), Objetivo: ${objetivo.alias} (${objetivo.esHeroe ? 'héroe' : 'villano'})`);
        }

        // Verificar que no se ataque a sí mismo (mismo objeto)
        if (atacante === objetivo) {
            throw new Error('Un personaje no puede atacarse a sí mismo');
        }

        // Debug: Mostrar información de los personajes encontrados
        console.log('DEBUG - Atacante:', {
            id: atacante.id,
            idUnico: atacante.idUnico,
            alias: atacante.alias,
            esHeroe: atacante.esHeroe,
            equipo: atacante.esHeroe ? 'héroes' : 'villanos',
            vida: atacante.vida
        });
        console.log('DEBUG - Objetivo:', {
            id: objetivo.id,
            idUnico: objetivo.idUnico,
            alias: objetivo.alias,
            esHeroe: objetivo.esHeroe,
            equipo: objetivo.esHeroe ? 'héroes' : 'villanos',
            vida: objetivo.vida
        });

        if (!atacante.estaActivo()) {
            throw new Error('El atacante no está activo');
        }

        if (!objetivo.estaVivo()) {
            throw new Error('El objetivo ya está eliminado');
        }

        // Verificar que el atacante sea del equipo que tiene el turno
        const equipoAtacante = atacante.esHeroe ? 'heroes' : 'villanos';
        if (equipoAtacante !== batalla.turno) {
            const equipoNombre = batalla.turno === 'heroes' ? 'héroes' : 'villanos';
            throw new Error(`No es el turno del equipo de ${equipoNombre}. Es el turno de ${batalla.turno === 'heroes' ? 'héroes' : 'villanos'}.`);
        }

        // Realizar el ataque
        const resultadoAtaque = batalla.atacar(atacante, objetivo, tipoAtaque);

        // Debug: Mostrar resultado del ataque
        console.log('DEBUG - Resultado del ataque:', {
            dano: resultadoAtaque.dano,
            vidaRestante: resultadoAtaque.vidaActual,
            eliminado: resultadoAtaque.eliminado,
            estadoBatalla: batalla.estado
        });

        // Cambiar turno después del ataque
        batalla.cambiarTurno();

        // Debug: Mostrar estado después del cambio de turno
        console.log('DEBUG - Estado después del cambio de turno:', {
            estado: batalla.estado,
            turno: batalla.turno,
            ronda: batalla.ronda,
            ganador: batalla.ganador,
            heroesVivos: batalla.equipoHeroes.getPersonajesVivos().length,
            villanosVivos: batalla.equipoVillanos.getPersonajesVivos().length
        });

        // Si la batalla terminó, guardarla en el historial
        if (batalla.estado === 'finalizada') {
            console.log('DEBUG - Batalla finalizada, guardando en historial');
            await guardarBatalla(batalla);
            batallasActivas.delete(batallaId);
        }

        return {
            success: true,
            batalla: batalla.getEstadoActual(),
            ataque: {
                atacante: atacante.alias,
                objetivo: objetivo.alias,
                tipoAtaque,
                dano: resultadoAtaque.dano,
                vidaRestante: resultadoAtaque.vidaActual,
                eliminado: resultadoAtaque.eliminado
            },
            mensaje: `${atacante.alias} atacó a ${objetivo.alias} con ${tipoAtaque} causando ${resultadoAtaque.dano} puntos de daño`
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function obtenerEstadoBatalla(batallaId) {
    try {
        const batalla = batallasActivas.get(batallaId);
        if (!batalla) {
            throw new Error('Batalla no encontrada o ya finalizada');
        }

        return {
            success: true,
            batalla: batalla.getEstadoActual(),
            mensaje: 'Estado de batalla obtenido'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function obtenerBatallasActivas() {
    try {
        const batallas = Array.from(batallasActivas.values()).map(batalla => ({
            id: batalla.id,
            estado: batalla.estado,
            ronda: batalla.ronda,
            turno: batalla.turno,
            ganador: batalla.ganador,
            fecha: batalla.fecha,
            equipoHeroes: {
                nombre: batalla.equipoHeroes.nombreEquipo,
                personajes: batalla.equipoHeroes.personajes.map(p => ({
                    id: p.id,
                    idUnico: p.idUnico,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo,
                    vivo: p.estaVivo()
                }))
            },
            equipoVillanos: {
                nombre: batalla.equipoVillanos.nombreEquipo,
                personajes: batalla.equipoVillanos.personajes.map(p => ({
                    id: p.id,
                    idUnico: p.idUnico,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo,
                    vivo: p.estaVivo()
                }))
            }
        }));

        return {
            success: true,
            batallas,
            total: batallas.length,
            mensaje: 'Batallas activas obtenidas'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function obtenerHistorialBatallas() {
    try {
        const batallas = await obtenerTodasLasBatallas();
        return {
            success: true,
            batallas,
            total: batallas.length,
            mensaje: 'Historial de batallas obtenido'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function obtenerEstadisticasBatallas() {
    try {
        const estadisticas = await obtenerEstadisticas();
        return {
            success: true,
            estadisticas,
            mensaje: 'Estadísticas obtenidas'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function simularBatallaCompleta(equipoHeroes, equipoVillanos, iniciador = 'heroes', primerHeroe = null, primerVillano = null) {
    try {
        // Crear batalla
        const resultadoCreacion = await crearBatalla(equipoHeroes, equipoVillanos, iniciador, primerHeroe, primerVillano);
        if (!resultadoCreacion.success) {
            return resultadoCreacion;
        }

        const batalla = batallasActivas.get(resultadoCreacion.batalla.id);
        batalla.iniciarBatalla();

        // Simular batalla automática
        let turnos = 0;
        const maxTurnos = 50; // Límite para evitar bucles infinitos

        while (batalla.estado === 'en_curso' && turnos < maxTurnos) {
            const equipoActual = batalla.turno === 'heroes' ? batalla.equipoHeroes : batalla.equipoVillanos;
            const equipoContrario = batalla.turno === 'heroes' ? batalla.equipoVillanos : batalla.equipoHeroes;
            
            const atacante = equipoActual.getPersonajeActual();
            const objetivo = equipoContrario.getPersonajesVivos()[0];

            if (!atacante || !objetivo) {
                break;
            }

            // Elegir tipo de ataque aleatorio
            const tiposAtaque = ['basico', 'especial', 'critico'];
            const tipoAtaque = tiposAtaque[Math.floor(Math.random() * tiposAtaque.length)];

            batalla.atacar(atacante, objetivo, tipoAtaque);
            batalla.cambiarTurno();
            turnos++;
        }

        // Guardar batalla finalizada
        await guardarBatalla(batalla);
        batallasActivas.delete(batalla.id);

        return {
            success: true,
            batalla: batalla.getEstadoActual(),
            turnosSimulados: turnos,
            mensaje: 'Batalla simulada completada'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function obtenerInfoBatalla(batallaId) {
    try {
        const batalla = batallasActivas.get(batallaId);
        if (!batalla) {
            throw new Error('Batalla no encontrada o ya finalizada');
        }

        return {
            success: true,
            batalla: batalla.getInfoDetallada(),
            mensaje: 'Información detallada de batalla obtenida'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function probarSistema() {
    try {
        // Crear una batalla de prueba
        const resultadoCreacion = await crearBatalla([1, 2, 3], [1, 2, 3], 'heroes', 1, 1);
        if (!resultadoCreacion.success) {
            return resultadoCreacion;
        }

        const batallaId = resultadoCreacion.batalla.id;
        const batalla = batallasActivas.get(batallaId);
        batalla.iniciarBatalla();

        // Realizar algunos ataques de prueba
        const ataques = [
            { atacanteId: 'H1', objetivoId: 'V1', tipoAtaque: 'basico' },
            { atacanteId: 'V2', objetivoId: 'H2', tipoAtaque: 'especial' },
            { atacanteId: 'H3', objetivoId: 'V3', tipoAtaque: 'critico' }
        ];

        for (const ataque of ataques) {
            if (batalla.estado === 'en_curso') {
                await realizarAtaque(batallaId, ataque.atacanteId, ataque.objetivoId, ataque.tipoAtaque);
            }
        }

        return {
            success: true,
            batalla: batalla.getEstadoActual(),
            mensaje: 'Sistema probado correctamente'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
} 