export class PersonajeBatalla {
    constructor(personaje, esHeroe = true) {
        this.id = personaje.id;
        this.name = personaje.name;
        this.alias = personaje.alias;
        this.team = personaje.team;
        this.esHeroe = esHeroe;
        this.vida = 200;
        this.vidaMaxima = 200;
        this.activo = true;
        this.orden = 0;
        // Barras de poder y defensa (0 a 100)
        this.powerBar = 0;
        this.defenseBar = 0;
        this.superAtaquePendiente = false;
        this.superDefensaPendiente = false;
        // Crear ID único para evitar conflictos
        this.idUnico = esHeroe ? `H${personaje.id}` : `V${personaje.id}`;
    }

    recibirDano(dano) {
        // Solo los personajes vivos pueden acumular barras de poder y defensa
        if (this.vida > 0) {
            this.powerBar += dano;
            if (this.powerBar > 100) this.powerBar = 100;
            this.defenseBar += dano;
            if (this.defenseBar > 100) this.defenseBar = 100;
        }
        
        // Aplicar super defensa si está pendiente y el personaje está vivo
        let danoFinal = dano;
        if (this.superDefensaPendiente && this.vida > 0) {
            danoFinal = Math.ceil(dano / 2);
            this.superDefensaPendiente = false;
        }
        
        this.vida = Math.max(0, this.vida - danoFinal);
        
        // Si el personaje muere, limpiar sus barras y estados especiales
        if (this.vida <= 0) {
            this.activo = false;
            this.powerBar = 0;
            this.defenseBar = 0;
            this.superAtaquePendiente = false;
            this.superDefensaPendiente = false;
        }
        
        return this.vida;
    }

    puedeUsarSuperAtaque() {
        return this.powerBar >= 100;
    }

    activarSuperAtaque() {
        if (this.puedeUsarSuperAtaque()) {
            this.superAtaquePendiente = true;
            this.powerBar = 0;
            return true;
        }
        return false;
    }

    puedeUsarSuperDefensa() {
        return this.defenseBar >= 100;
    }

    activarSuperDefensa() {
        if (this.puedeUsarSuperDefensa()) {
            this.superDefensaPendiente = true;
            this.defenseBar = 0;
            return true;
        }
        return false;
    }



    estaVivo() {
        return this.vida > 0;
    }

    estaActivo() {
        return this.activo && this.estaVivo();
    }
}

export class EquipoBatalla {
    constructor(personajes, nombreEquipo, esHeroe = true) {
        this.personajes = personajes.map(p => new PersonajeBatalla(p, esHeroe));
        this.nombreEquipo = nombreEquipo;
        this.esHeroe = esHeroe;
        this.personajeActual = 0;
        this.ganador = false;
    }

    getPersonajeActual() {
        if (this.personajes.length === 0) return null;
        return this.personajes[this.personajeActual];
    }

    setPersonajeInicial(personajeId) {
        const index = this.personajes.findIndex(p => p.id === personajeId);
        if (index !== -1) {
            this.personajeActual = index;
            return this.personajes[index];
        }
        return null;
    }

    siguientePersonaje() {
        const personajeActual = this.personajes[this.personajeActual];
        console.log('DEBUG - Personaje actual antes del cambio:', {
            indice: this.personajeActual,
            alias: personajeActual ? personajeActual.alias : 'null',
            vida: personajeActual ? personajeActual.vida : 'null',
            activo: personajeActual ? personajeActual.estaActivo() : 'null'
        });
        
        this.personajeActual = (this.personajeActual + 1) % this.personajes.length;
        // Buscar el siguiente personaje activo
        let intentos = 0;
        while (!this.personajes[this.personajeActual].estaActivo() && intentos < this.personajes.length) {
            console.log('DEBUG - Personaje no activo, buscando siguiente:', {
                indice: this.personajeActual,
                alias: this.personajes[this.personajeActual].alias,
                vida: this.personajes[this.personajeActual].vida,
                activo: this.personajes[this.personajeActual].estaActivo()
            });
            this.personajeActual = (this.personajeActual + 1) % this.personajes.length;
            intentos++;
        }
        
        const siguientePersonaje = this.getPersonajeActual();
        console.log('DEBUG - Siguiente personaje encontrado:', {
            indice: this.personajeActual,
            alias: siguientePersonaje ? siguientePersonaje.alias : 'null',
            vida: siguientePersonaje ? siguientePersonaje.vida : 'null',
            activo: siguientePersonaje ? siguientePersonaje.estaActivo() : 'null'
        });
        
        return siguientePersonaje;
    }

    tienePersonajesVivos() {
        return this.personajes.some(p => p.estaVivo());
    }

    getPersonajesVivos() {
        return this.personajes.filter(p => p.estaVivo());
    }

    getPersonajesActivos() {
        return this.personajes.filter(p => p.estaActivo());
    }
}

export class BatallaEquipo {
    constructor(equipoHeroes, equipoVillanos, iniciador = 'heroes', primerHeroe = null, primerVillano = null) {
        this.equipoHeroes = equipoHeroes;
        this.equipoVillanos = equipoVillanos;
        this.iniciador = iniciador; // 'heroes' o 'villanos'
        this.ronda = 1;
        this.maxRondas = 3;
        this.turno = iniciador;
        this.historial = [];
        this.estado = 'iniciando'; // iniciando, en_curso, finalizada
        this.ganador = null;
        this.fecha = new Date().toISOString();
        this.id = Date.now().toString();
        
        // Configurar personajes iniciales si se especifican
        if (primerHeroe) {
            this.equipoHeroes.setPersonajeInicial(primerHeroe);
        }
        if (primerVillano) {
            this.equipoVillanos.setPersonajeInicial(primerVillano);
        }
    }

    iniciarBatalla() {
        this.estado = 'en_curso';
        this.registrarEvento('Batalla iniciada', `Equipo ${this.iniciador} inicia la batalla`);
        return this;
    }

    registrarEvento(tipo, descripcion, datos = {}) {
        this.historial.push({
            turno: this.turno,
            ronda: this.ronda,
            tipo,
            descripcion,
            datos,
            timestamp: new Date().toISOString()
        });
    }

    atacar(atacante, objetivo, tipoAtaque) {
        // Validar que el objetivo esté vivo antes de atacar
        if (!objetivo.estaVivo()) {
            throw new Error(`No se puede atacar a ${objetivo.alias} porque ya está eliminado`);
        }
        
        // Validar que el atacante esté vivo
        if (!atacante.estaVivo()) {
            throw new Error(`${atacante.alias} no puede atacar porque está eliminado`);
        }
        
        let dano = 0;
        let descripcion = '';

        switch (tipoAtaque) {
            case 'basico':
                dano = 5;
                descripcion = 'Golpe básico';
                break;
            case 'especial':
                dano = 30;
                descripcion = 'Golpe especial';
                break;
            case 'critico':
                dano = 45;
                descripcion = 'Golpe crítico';
                break;
            default:
                dano = 5;
                descripcion = 'Golpe básico';
        }

        // Aplicar superataque si está pendiente
        if (atacante.superAtaquePendiente) {
            dano = dano * 2;
            descripcion += ' (SUPERATAQUE)';
            atacante.superAtaquePendiente = false;
        }

        // Permitir activar superataque si la barra está llena
        if (atacante.puedeUsarSuperAtaque && atacante.puedeUsarSuperAtaque()) {
            // Aquí podrías decidir si se activa automáticamente o dejarlo a decisión del usuario
            // atacante.activarSuperAtaque();
        }

        // Permitir activar superdefensa si la barra está llena
        if (objetivo.puedeUsarSuperDefensa && objetivo.puedeUsarSuperDefensa()) {
            // objetivo.activarSuperDefensa();
        }

        const vidaAnterior = objetivo.vida;
        objetivo.recibirDano(dano);
        const vidaActual = objetivo.vida;

        this.registrarEvento('ataque', `${atacante.alias} ataca a ${objetivo.alias} con ${descripcion}`, {
            atacante: atacante.alias,
            objetivo: objetivo.alias,
            tipoAtaque,
            dano,
            vidaAnterior,
            vidaActual,
            objetivoEliminado: !objetivo.estaVivo(),
            powerBarAtacante: atacante.powerBar,
            defenseBarObjetivo: objetivo.defenseBar
        });

        // Verificar si el objetivo fue eliminado
        if (!objetivo.estaVivo()) {
            this.registrarEvento('eliminacion', `${objetivo.alias} ha sido eliminado`);
            
            console.log('DEBUG - Personaje eliminado:', {
                alias: objetivo.alias,
                idUnico: objetivo.idUnico,
                equipo: objetivo.esHeroe ? 'héroes' : 'villanos',
                vida: objetivo.vida
            });
            
            // Incrementar ronda cuando un personaje muere
            this.ronda++;
            console.log('DEBUG - Nueva ronda iniciada por eliminación:', this.ronda);
            this.registrarEvento('nueva_ronda', `Inicia la ronda ${this.ronda} - ${objetivo.alias} eliminado`);
            
            // Verificar si el equipo del objetivo perdió (todos sus personajes eliminados)
            const equipoObjetivo = objetivo.esHeroe ? this.equipoHeroes : this.equipoVillanos;
            const personajesVivosEquipoObjetivo = equipoObjetivo.getPersonajesVivos();
            
            console.log('DEBUG - Verificación de equipo objetivo:', {
                equipo: objetivo.esHeroe ? 'héroes' : 'villanos',
                personajesVivos: personajesVivosEquipoObjetivo.length,
                personajesVivosDetalle: personajesVivosEquipoObjetivo.map(p => ({
                    alias: p.alias,
                    idUnico: p.idUnico,
                    vida: p.vida
                }))
            });
            
            if (!equipoObjetivo.tienePersonajesVivos()) {
                console.log('DEBUG - Todo el equipo objetivo eliminado, finalizando batalla');
                this.finalizarBatalla();
            } else if (this.ronda > this.maxRondas) {
                console.log('DEBUG - Máximo de rondas alcanzado, finalizando batalla');
                this.finalizarBatalla();
            } else {
                console.log('DEBUG - Equipo objetivo aún tiene personajes vivos, continuando batalla');
            }
        }

        return { dano, vidaActual, eliminado: !objetivo.estaVivo() };
    }

    cambiarTurno() {
        // Cambiar turno
        this.turno = this.turno === 'heroes' ? 'villanos' : 'heroes';
        
        // Obtener el equipo actual después del cambio de turno
        const equipoActual = this.turno === 'heroes' ? this.equipoHeroes : this.equipoVillanos;
        const equipoContrario = this.turno === 'heroes' ? this.equipoVillanos : this.equipoHeroes;
        
        // Debug: Mostrar información de equipos
        console.log('DEBUG - Cambio de turno:', {
            turnoAnterior: this.turno === 'heroes' ? 'villanos' : 'heroes',
            turnoActual: this.turno,
            equipoActual: this.turno,
            personajesActualesVivos: equipoActual.getPersonajesVivos().length,
            personajesContrariosVivos: equipoContrario.getPersonajesVivos().length
        });
        
        // Verificar si el equipo contrario tiene personajes vivos
        if (!equipoContrario.tienePersonajesVivos()) {
            console.log('DEBUG - Equipo contrario eliminado, finalizando batalla');
            this.finalizarBatalla();
            return;
        }

        // Cambiar al siguiente personaje del equipo actual
        const siguientePersonaje = equipoActual.siguientePersonaje();
        if (!siguientePersonaje) {
            console.log('DEBUG - No hay personajes activos en el equipo actual, finalizando batalla');
            this.finalizarBatalla();
            return;
        }

        // Registrar el cambio de turno
        const equipoNombre = this.turno === 'heroes' ? 'Héroes' : 'Villanos';
        const personajeActual = equipoActual.getPersonajeActual();
        if (personajeActual) {
            console.log('DEBUG - Personaje actual del turno:', {
                alias: personajeActual.alias,
                idUnico: personajeActual.idUnico,
                vida: personajeActual.vida
            });
            this.registrarEvento('cambio_turno', `Turno de ${equipoNombre}: ${personajeActual.alias}`);
        }
    }

    finalizarBatalla() {
        this.estado = 'finalizada';
        
        // Determinar ganador basado en qué equipo tiene personajes vivos o por rondas
        const heroesVivos = this.equipoHeroes.tienePersonajesVivos();
        const villanosVivos = this.equipoVillanos.tienePersonajesVivos();
        
        console.log('DEBUG - Finalizando batalla:', {
            heroesVivos,
            villanosVivos,
            ronda: this.ronda,
            maxRondas: this.maxRondas
        });
        
        if (!heroesVivos && !villanosVivos) {
            this.ganador = 'empate';
        } else if (!heroesVivos) {
            this.ganador = 'villanos';
        } else if (!villanosVivos) {
            this.ganador = 'heroes';
        } else if (this.ronda > this.maxRondas) {
            // Si se alcanzó el máximo de rondas, ganador por puntos de vida total
            const vidaHeroes = this.equipoHeroes.personajes.reduce((total, p) => total + p.vida, 0);
            const vidaVillanos = this.equipoVillanos.personajes.reduce((total, p) => total + p.vida, 0);
            
            console.log('DEBUG - Comparando vida total por rondas máximas:', {
                vidaHeroes,
                vidaVillanos
            });
            
            if (vidaHeroes > vidaVillanos) {
                this.ganador = 'heroes';
            } else if (vidaVillanos > vidaHeroes) {
                this.ganador = 'villanos';
            } else {
                this.ganador = 'empate';
            }
        } else {
            // Si ambos equipos tienen personajes vivos, determinar por puntos de vida total
            const vidaHeroes = this.equipoHeroes.personajes.reduce((total, p) => total + p.vida, 0);
            const vidaVillanos = this.equipoVillanos.personajes.reduce((total, p) => total + p.vida, 0);
            
            console.log('DEBUG - Comparando vida total:', {
                vidaHeroes,
                vidaVillanos
            });
            
            if (vidaHeroes > vidaVillanos) {
                this.ganador = 'heroes';
            } else if (vidaVillanos > vidaHeroes) {
                this.ganador = 'villanos';
            } else {
                this.ganador = 'empate';
            }
        }

        this.registrarEvento('batalla_finalizada', `Batalla finalizada. Ganador: ${this.ganador}`);
    }

    getEstadoActual() {
        const equipoActual = this.turno === 'heroes' ? this.equipoHeroes : this.equipoVillanos;
        const personajeActual = equipoActual.getPersonajeActual();
        
        return {
            id: this.id,
            estado: this.estado,
            ronda: this.ronda,
            turno: this.turno,
            ganador: this.ganador,
            personajeActual: personajeActual ? {
                id: personajeActual.id,
                idUnico: personajeActual.idUnico,
                alias: personajeActual.alias,
                equipo: this.turno,
                powerBar: personajeActual.powerBar,
                defenseBar: personajeActual.defenseBar
            } : null,
            equipoHeroes: {
                nombre: this.equipoHeroes.nombreEquipo,
                personajes: this.equipoHeroes.personajes.map(p => ({
                    id: p.id,
                    idUnico: p.idUnico,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo,
                    vivo: p.estaVivo(),
                    powerBar: p.powerBar,
                    defenseBar: p.defenseBar
                }))
            },
            equipoVillanos: {
                nombre: this.equipoVillanos.nombreEquipo,
                personajes: this.equipoVillanos.personajes.map(p => ({
                    id: p.id,
                    idUnico: p.idUnico,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo,
                    vivo: p.estaVivo(),
                    powerBar: p.powerBar,
                    defenseBar: p.defenseBar
                }))
            },
            historial: this.historial
        };
    }

    getInfoDetallada() {
        const equipoActual = this.turno === 'heroes' ? this.equipoHeroes : this.equipoVillanos;
        const personajeActual = equipoActual.getPersonajeActual();
        
        // Obtener personajes que pueden atacar (del equipo actual)
        const personajesAtacantes = equipoActual.getPersonajesActivos().map(p => ({
            id: p.id,
            idUnico: p.idUnico,
            alias: p.alias,
            vida: p.vida,
            equipo: this.turno,
            powerBar: p.powerBar,
            defenseBar: p.defenseBar
        }));

        // Obtener personajes que pueden ser atacados (del equipo contrario)
        const equipoContrario = this.turno === 'heroes' ? this.equipoVillanos : this.equipoHeroes;
        const personajesObjetivo = equipoContrario.getPersonajesVivos().map(p => ({
            id: p.id,
            idUnico: p.idUnico,
            alias: p.alias,
            vida: p.vida,
            equipo: this.turno === 'heroes' ? 'villanos' : 'heroes',
            powerBar: p.powerBar,
            defenseBar: p.defenseBar
        }));

        return {
            id: this.id,
            estado: this.estado,
            ronda: this.ronda,
            turno: this.turno,
            ganador: this.ganador,
            personajeActual: personajeActual ? {
                id: personajeActual.id,
                idUnico: personajeActual.idUnico,
                alias: personajeActual.alias,
                equipo: this.turno,
                powerBar: personajeActual.powerBar,
                defenseBar: personajeActual.defenseBar
            } : null,
            personajesAtacantes,
            personajesObjetivo,
            equipoHeroes: {
                nombre: this.equipoHeroes.nombreEquipo,
                personajes: this.equipoHeroes.personajes.map(p => ({
                    id: p.id,
                    idUnico: p.idUnico,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo,
                    vivo: p.estaVivo(),
                    powerBar: p.powerBar,
                    defenseBar: p.defenseBar
                }))
            },
            equipoVillanos: {
                nombre: this.equipoVillanos.nombreEquipo,
                personajes: this.equipoVillanos.personajes.map(p => ({
                    id: p.id,
                    idUnico: p.idUnico,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo,
                    vivo: p.estaVivo(),
                    powerBar: p.powerBar,
                    defenseBar: p.defenseBar
                }))
            }
        };
    }

    toJSON() {
        return {
            id: this.id,
            estado: this.estado,
            ronda: this.ronda,
            turno: this.turno,
            ganador: this.ganador,
            fecha: this.fecha,
            historial: this.historial,
            equipoHeroes: this.equipoHeroes,
            equipoVillanos: this.equipoVillanos
        };
    }
} 