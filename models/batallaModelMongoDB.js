import mongoose from 'mongoose';

// Esquema para personajes en batalla
const personajeBatallaSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    alias: { type: String, required: true },
    team: { type: String, required: true },
    esHeroe: { type: Boolean, required: true },
    vida: { type: Number, default: 200 },
    vidaMaxima: { type: Number, default: 200 },
    activo: { type: Boolean, default: true },
    orden: { type: Number, default: 0 },
    powerBar: { type: Number, default: 0 },
    defenseBar: { type: Number, default: 0 },
    superAtaquePendiente: { type: Boolean, default: false },
    superDefensaPendiente: { type: Boolean, default: false },
    idUnico: { type: String, required: true }
}, { _id: false });

// Esquema para equipos en batalla
const equipoBatallaSchema = new mongoose.Schema({
    personajes: [personajeBatallaSchema],
    nombreEquipo: { type: String, required: true },
    esHeroe: { type: Boolean, required: true },
    personajeActual: { type: Number, default: 0 },
    ganador: { type: Boolean, default: false }
}, { _id: false });

// Esquema para eventos del historial
const eventoHistorialSchema = new mongoose.Schema({
    turno: { type: String, required: true },
    ronda: { type: Number, required: true },
    tipo: { type: String, required: true },
    descripcion: { type: String, required: true },
    datos: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

// Esquema principal de batalla
const batallaSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    equipoHeroes: { type: equipoBatallaSchema, required: true },
    equipoVillanos: { type: equipoBatallaSchema, required: true },
    iniciador: { type: String, enum: ['heroes', 'villanos'], required: true },
    ronda: { type: Number, default: 1 },
    maxRondas: { type: Number, default: 3 },
    turno: { type: String, enum: ['heroes', 'villanos'], required: true },
    historial: [eventoHistorialSchema],
    estado: { 
        type: String, 
        enum: ['iniciando', 'en_curso', 'finalizada'], 
        default: 'iniciando' 
    },
    ganador: { 
        type: String, 
        enum: ['heroes', 'villanos', 'empate'], 
        default: null 
    },
    fecha: { type: Date, default: Date.now },
    fechaFinalizacion: { type: Date },
    duracionMinutos: { type: Number }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para optimizar consultas
batallaSchema.index({ userId: 1, estado: 1 });
batallaSchema.index({ userId: 1, fecha: -1 });
batallaSchema.index({ estado: 1 });
batallaSchema.index({ ganador: 1 });
batallaSchema.index({ fecha: -1 });
batallaSchema.index({ 'equipoHeroes.personajes.alias': 1 });
batallaSchema.index({ 'equipoVillanos.personajes.alias': 1 });

// Virtual para obtener estadísticas de la batalla
batallaSchema.virtual('estadisticas').get(function() {
    const heroesVivos = this.equipoHeroes.personajes.filter(p => p.vida > 0).length;
    const villanosVivos = this.equipoVillanos.personajes.filter(p => p.vida > 0).length;
    const totalEventos = this.historial.length;
    const ataques = this.historial.filter(h => h.tipo === 'ataque').length;
    
    return {
        heroesVivos,
        villanosVivos,
        totalEventos,
        ataques,
        rondas: this.ronda
    };
});

// Método para finalizar batalla
batallaSchema.methods.finalizarBatalla = function() {
    this.estado = 'finalizada';
    this.fechaFinalizacion = new Date();
    
    if (this.fecha) {
        this.duracionMinutos = Math.round((this.fechaFinalizacion - this.fecha) / 60000);
    }
    
    return this.save();
};

// Método estático para obtener estadísticas generales
batallaSchema.statics.obtenerEstadisticas = async function() {
    const [totales, porGanador, porMes] = await Promise.all([
        this.countDocuments(),
        this.aggregate([
            { $match: { estado: 'finalizada' } },
            { $group: { _id: '$ganador', total: { $sum: 1 } } }
        ]),
        this.aggregate([
            { $match: { estado: 'finalizada' } },
            { 
                $group: {
                    _id: {
                        año: { $year: '$fecha' },
                        mes: { $month: '$fecha' }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { '_id.año': -1, '_id.mes': -1 } },
            { $limit: 12 }
        ])
    ]);
    
    return {
        totalBatallas: totales,
        porGanador,
        porMes
    };
};

const Batalla = mongoose.model('Batalla', batallaSchema);

export default Batalla;
