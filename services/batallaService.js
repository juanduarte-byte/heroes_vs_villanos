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

export async function crearBatalla(equipoHeroes, equipoVillanos, iniciador = 'heroes') {
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

        // Crear equipos
        const equipoHeroesBatalla = new EquipoBatalla(heroesValidados, 'Equipo de Héroes', true);
        const equipoVillanosBatalla = new EquipoBatalla(villanosValidados, 'Equipo de Villanos', false);

        // Crear batalla
        const batalla = new BatallaEquipo(equipoHeroesBatalla, equipoVillanosBatalla, iniciador);
        
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
                esHeroe: atacante.esHeroe
            } : null,
            objetivoEncontrado: objetivo ? {
                id: objetivo.id,
                idUnico: objetivo.idUnico,
                alias: objetivo.alias,
                esHeroe: objetivo.esHeroe
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
            equipo: atacante.esHeroe ? 'héroes' : 'villanos'
        });
        console.log('DEBUG - Objetivo:', {
            id: objetivo.id,
            idUnico: objetivo.idUnico,
            alias: objetivo.alias,
            esHeroe: objetivo.esHeroe,
            equipo: objetivo.esHeroe ? 'héroes' : 'villanos'
        });

        if (!atacante.estaActivo()) {
            throw new Error('El atacante no está activo');
        }

        if (!objetivo.estaVivo()) {
            throw new Error('El objetivo ya está eliminado');
        }

        // Verificar que es el turno correcto
        const turnoCorrecto = (atacante.esHeroe && batalla.turno === 'heroes') || 
                             (!atacante.esHeroe && batalla.turno === 'villanos');

        if (!turnoCorrecto) {
            const equipoActual = batalla.turno === 'heroes' ? 'héroes' : 'villanos';
            throw new Error(`No es el turno del atacante. Actualmente es el turno de: ${equipoActual}`);
        }

        // Realizar ataque
        const resultado = batalla.atacar(atacante, objetivo, tipoAtaque);

        // Cambiar turno si la batalla no ha terminado
        if (batalla.estado === 'en_curso') {
            batalla.cambiarTurno();
        }

        // Si la batalla terminó, guardarla
        if (batalla.estado === 'finalizada') {
            await guardarBatalla(batalla);
            batallasActivas.delete(batallaId);
        }

        return {
            success: true,
            resultado,
            batalla: batalla.getEstadoActual(),
            mensaje: `Ataque realizado: ${atacante.alias} atacó a ${objetivo.alias}`
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
            // Buscar en batallas guardadas
            const batallaGuardada = await obtenerBatallaPorId(batallaId);
            if (batallaGuardada) {
                return {
                    success: true,
                    batalla: batallaGuardada,
                    mensaje: 'Batalla finalizada'
                };
            }
            throw new Error('Batalla no encontrada');
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
            equipoHeroes: {
                nombre: batalla.equipoHeroes.nombreEquipo,
                personajes: batalla.equipoHeroes.personajes.map(p => ({
                    id: p.id,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo
                }))
            },
            equipoVillanos: {
                nombre: batalla.equipoVillanos.nombreEquipo,
                personajes: batalla.equipoVillanos.personajes.map(p => ({
                    id: p.id,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo
                }))
            }
        }));

        return {
            success: true,
            batallas,
            mensaje: `${batallas.length} batallas activas encontradas`
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
            mensaje: `${batallas.length} batallas en el historial`
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

export async function simularBatallaCompleta(equipoHeroes, equipoVillanos, iniciador = 'heroes') {
    try {
        // Crear batalla
        const resultadoCreacion = await crearBatalla(equipoHeroes, equipoVillanos, iniciador);
        if (!resultadoCreacion.success) {
            throw new Error(resultadoCreacion.error);
        }

        const batalla = batallasActivas.get(resultadoCreacion.batalla.id);
        
        // Iniciar batalla
        batalla.iniciarBatalla();

        // Simular batalla completa
        while (batalla.estado === 'en_curso') {
            const equipoActual = batalla.turno === 'heroes' ? batalla.equipoHeroes : batalla.equipoVillanos;
            const equipoObjetivo = batalla.turno === 'heroes' ? batalla.equipoVillanos : batalla.equipoHeroes;
            
            const atacante = equipoActual.getPersonajeActual();
            const objetivo = equipoObjetivo.getPersonajeActual();
            
            if (!atacante || !objetivo) {
                break;
            }

            // Elegir tipo de ataque aleatorio
            const tiposAtaque = ['basico', 'especial', 'critico'];
            const tipoAtaque = tiposAtaque[Math.floor(Math.random() * tiposAtaque.length)];
            
            batalla.atacar(atacante, objetivo, tipoAtaque);
            batalla.cambiarTurno();
        }

        // Guardar batalla
        await guardarBatalla(batalla);
        batallasActivas.delete(batalla.id);

        return {
            success: true,
            batalla: batalla.toJSON(),
            mensaje: `Batalla simulada completada. Ganador: ${batalla.ganador}`
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

        const heroesActivos = batalla.equipoHeroes.personajes
            .filter(p => p.estaVivo())
            .map(p => ({
                id: p.id,
                idUnico: p.idUnico,
                alias: p.alias,
                vida: p.vida,
                vidaMaxima: p.vidaMaxima,
                estaActivo: p.estaActivo()
            }));

        const villanosActivos = batalla.equipoVillanos.personajes
            .filter(p => p.estaVivo())
            .map(p => ({
                id: p.id,
                idUnico: p.idUnico,
                alias: p.alias,
                vida: p.vida,
                vidaMaxima: p.vidaMaxima,
                estaActivo: p.estaActivo()
            }));

        const turnoActual = batalla.turno;
        const atacantesValidos = turnoActual === 'heroes' ? heroesActivos : villanosActivos;
        const objetivosValidos = turnoActual === 'heroes' ? villanosActivos : heroesActivos;

        return {
            success: true,
            info: {
                estado: batalla.estado,
                turno: turnoActual,
                ronda: batalla.ronda,
                atacantesValidos,
                objetivosValidos,
                heroes: heroesActivos,
                villanos: villanosActivos,
                debug: {
                    totalHeroes: batalla.equipoHeroes.personajes.length,
                    totalVillanos: batalla.equipoVillanos.personajes.length,
                    heroesVivos: heroesActivos.length,
                    villanosVivos: villanosActivos.length
                }
            },
            mensaje: 'Información de la batalla obtenida'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Función de prueba para verificar el guardado y diagnosticar problemas
export async function probarSistema() {
    try {
        console.log('=== PRUEBA DEL SISTEMA ===');
        
        // 1. Crear una batalla de prueba
        const resultadoCreacion = await crearBatalla([1, 2, 3], [1, 2, 3], 'villanos');
        if (!resultadoCreacion.success) {
            throw new Error(resultadoCreacion.error);
        }
        
        const batalla = batallasActivas.get(resultadoCreacion.batalla.id);
        console.log('✅ Batalla creada:', batalla.id);
        
        // 2. Verificar que los personajes se cargaron correctamente
        console.log('📊 Equipo Héroes:');
        batalla.equipoHeroes.personajes.forEach(p => {
            console.log(`  - ID: ${p.id}, Alias: ${p.alias}, Es Héroe: ${p.esHeroe}`);
        });
        
        console.log('📊 Equipo Villanos:');
        batalla.equipoVillanos.personajes.forEach(p => {
            console.log(`  - ID: ${p.id}, Alias: ${p.alias}, Es Héroe: ${p.esHeroe}`);
        });
        
        // 3. Iniciar batalla
        batalla.iniciarBatalla();
        console.log('✅ Batalla iniciada');
        
        // 4. Simular un ataque para que termine la batalla
        const atacante = batalla.equipoVillanos.getPersonajeActual();
        const objetivo = batalla.equipoHeroes.getPersonajeActual();
        
        if (atacante && objetivo) {
            console.log(`⚔️ Simulando ataque: ${atacante.alias} ataca a ${objetivo.alias}`);
            batalla.atacar(atacante, objetivo, 'critico');
            batalla.cambiarTurno();
        }
        
        // 5. Forzar finalización de batalla
        batalla.finalizarBatalla();
        console.log('✅ Batalla finalizada');
        
        // 6. Guardar batalla
        const guardado = await guardarBatalla(batalla);
        if (guardado) {
            console.log('✅ Batalla guardada en archivo JSON');
        } else {
            console.log('❌ Error guardando batalla');
        }
        
        // 7. Verificar que se guardó
        const batallasGuardadas = await obtenerTodasLasBatallas();
        console.log(`📁 Total de batallas guardadas: ${batallasGuardadas.length}`);
        
        // 8. Limpiar de memoria
        batallasActivas.delete(batalla.id);
        
        return {
            success: true,
            mensaje: 'Prueba completada exitosamente',
            batallasGuardadas: batallasGuardadas.length
        };
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
        return {
            success: false,
            error: error.message
        };
    }
} 