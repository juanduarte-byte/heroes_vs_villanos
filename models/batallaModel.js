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
    }

    recibirDano(dano) {
        this.vida = Math.max(0, this.vida - dano);
        if (this.vida <= 0) {
            this.activo = false;
        }
        return this.vida;
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

    siguientePersonaje() {
        this.personajeActual = (this.personajeActual + 1) % this.personajes.length;
        // Buscar el siguiente personaje activo
        let intentos = 0;
        while (!this.personajes[this.personajeActual].estaActivo() && intentos < this.personajes.length) {
            this.personajeActual = (this.personajeActual + 1) % this.personajes.length;
            intentos++;
        }
        return this.getPersonajeActual();
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
    constructor(equipoHeroes, equipoVillanos, iniciador = 'heroes') {
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
            objetivoEliminado: !objetivo.estaVivo()
        });

        // Verificar si el objetivo fue eliminado
        if (!objetivo.estaVivo()) {
            this.registrarEvento('eliminacion', `${objetivo.alias} ha sido eliminado`);
            
            // Verificar si el equipo del objetivo perdió
            const equipoObjetivo = this.turno === 'heroes' ? this.equipoVillanos : this.equipoHeroes;
            if (!equipoObjetivo.tienePersonajesVivos()) {
                this.finalizarBatalla();
            }
        }

        return { dano, vidaActual, eliminado: !objetivo.estaVivo() };
    }

    cambiarTurno() {
        // Cambiar turno
        this.turno = this.turno === 'heroes' ? 'villanos' : 'heroes';
        
        // Verificar si el equipo actual tiene personajes vivos
        const equipoActual = this.turno === 'heroes' ? this.equipoHeroes : this.equipoVillanos;
        if (!equipoActual.tienePersonajesVivos()) {
            this.finalizarBatalla();
            return;
        }

        // Cambiar al siguiente personaje del equipo actual
        const siguientePersonaje = equipoActual.siguientePersonaje();
        if (!siguientePersonaje) {
            this.finalizarBatalla();
            return;
        }

        // Verificar si terminó la ronda (cuando volvemos al iniciador)
        if (this.turno === this.iniciador) {
            this.ronda++;
            if (this.ronda > this.maxRondas) {
                this.finalizarBatalla();
                return;
            }
            this.registrarEvento('nueva_ronda', `Inicia la ronda ${this.ronda}`);
        }

        // Registrar el cambio de turno
        const equipoNombre = this.turno === 'heroes' ? 'Héroes' : 'Villanos';
        const personajeActual = equipoActual.getPersonajeActual();
        if (personajeActual) {
            this.registrarEvento('cambio_turno', `Turno de ${equipoNombre}: ${personajeActual.alias}`);
        }
    }

    finalizarBatalla() {
        this.estado = 'finalizada';
        
        // Determinar ganador
        const heroesVivos = this.equipoHeroes.tienePersonajesVivos();
        const villanosVivos = this.equipoVillanos.tienePersonajesVivos();
        
        if (!heroesVivos && !villanosVivos) {
            this.ganador = 'empate';
        } else if (!heroesVivos) {
            this.ganador = 'villanos';
        } else if (!villanosVivos) {
            this.ganador = 'heroes';
        } else {
            // Si llegamos al límite de rondas, ganador por puntos de vida
            const vidaHeroes = this.equipoHeroes.personajes.reduce((total, p) => total + p.vida, 0);
            const vidaVillanos = this.equipoVillanos.personajes.reduce((total, p) => total + p.vida, 0);
            
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
                alias: personajeActual.alias,
                equipo: this.turno
            } : null,
            equipoHeroes: {
                nombre: this.equipoHeroes.nombreEquipo,
                personajes: this.equipoHeroes.personajes.map(p => ({
                    id: p.id,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo,
                    vivo: p.estaVivo()
                }))
            },
            equipoVillanos: {
                nombre: this.equipoVillanos.nombreEquipo,
                personajes: this.equipoVillanos.personajes.map(p => ({
                    id: p.id,
                    alias: p.alias,
                    vida: p.vida,
                    activo: p.activo,
                    vivo: p.estaVivo()
                }))
            },
            historial: this.historial.slice(-10) // Últimos 10 eventos
        };
    }

    toJSON() {
        return {
            id: this.id,
            fecha: this.fecha,
            estado: this.estado,
            ganador: this.ganador,
            ronda: this.ronda,
            maxRondas: this.maxRondas,
            iniciador: this.iniciador,
            equipoHeroes: {
                nombre: this.equipoHeroes.nombreEquipo,
                personajes: this.equipoHeroes.personajes.map(p => ({
                    id: p.id,
                    alias: p.alias,
                    vidaFinal: p.vida,
                    eliminado: !p.estaVivo()
                }))
            },
            equipoVillanos: {
                nombre: this.equipoVillanos.nombreEquipo,
                personajes: this.equipoVillanos.personajes.map(p => ({
                    id: p.id,
                    alias: p.alias,
                    vidaFinal: p.vida,
                    eliminado: !p.estaVivo()
                }))
            },
            historial: this.historial
        };
    }
} 