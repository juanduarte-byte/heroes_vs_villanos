import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Batalla from '../models/batallaModelMongoDB.js';
import fs from 'fs-extra';
import path from 'path';

dotenv.config();

const BATALLAS_FILE = './data/batallas.json';

async function migrarBatallasAMongoDB() {
    try {
        console.log('🚀 Iniciando migración de batallas a MongoDB...');
        
        // Conectar a MongoDB
        await connectDB();
        
        // Verificar si el archivo de batallas existe
        const existeArchivo = await fs.pathExists(BATALLAS_FILE);
        if (!existeArchivo) {
            console.log('📝 No se encontró archivo de batallas JSON. No hay nada que migrar.');
            return;
        }
        
        // Leer batallas del archivo JSON
        const batallasJson = await fs.readJson(BATALLAS_FILE);
        
        if (!Array.isArray(batallasJson) || batallasJson.length === 0) {
            console.log('📝 No hay batallas en el archivo JSON para migrar.');
            return;
        }
        
        console.log(`📊 Encontradas ${batallasJson.length} batallas para migrar`);
        
        // Verificar cuántas batallas ya existen en MongoDB
        const batallasMongoDB = await Batalla.countDocuments();
        console.log(`📊 Batallas existentes en MongoDB: ${batallasMongoDB}`);
        
        let batallasNuevas = 0;
        let batallasActualizadas = 0;
        let errores = 0;
        
        for (const batallaData of batallasJson) {
            try {
                // Limpiar y preparar los datos
                const datosLimpios = { ...batallaData };
                
                // Limpiar el ID si viene del JSON (MongoDB creará uno nuevo)
                delete datosLimpios.id;
                delete datosLimpios._id;
                
                // Convertir fecha a Date si es string
                if (typeof datosLimpios.fecha === 'string') {
                    datosLimpios.fecha = new Date(datosLimpios.fecha);
                }
                
                // Verificar que la fecha sea válida
                if (isNaN(datosLimpios.fecha.getTime())) {
                    console.log(`⚠️  Fecha inválida, usando fecha actual para batalla: ${JSON.stringify(datosLimpios.fecha)}`);
                    datosLimpios.fecha = new Date();
                }
                
                // Inferir el iniciador del primer evento del historial si no existe
                if (!datosLimpios.iniciador) {
                    const primerEvento = datosLimpios.historial?.[0];
                    if (primerEvento && primerEvento.descripcion && primerEvento.descripcion.includes('Equipo')) {
                        if (primerEvento.descripcion.includes('villanos')) {
                            datosLimpios.iniciador = 'villanos';
                        } else if (primerEvento.descripcion.includes('heroes')) {
                            datosLimpios.iniciador = 'heroes';
                        } else {
                            datosLimpios.iniciador = 'heroes'; // Por defecto
                        }
                    } else {
                        datosLimpios.iniciador = 'heroes'; // Por defecto
                    }
                }
                
                // Asegurar que los timestamps del historial sean válidos
                if (datosLimpios.historial && Array.isArray(datosLimpios.historial)) {
                    datosLimpios.historial = datosLimpios.historial.map(evento => ({
                        ...evento,
                        timestamp: typeof evento.timestamp === 'string' ? new Date(evento.timestamp) : evento.timestamp
                    }));
                }
                
                // Asegurar que maxRondas esté presente
                if (!datosLimpios.maxRondas) {
                    datosLimpios.maxRondas = 3;
                }
                
                // Verificar si la batalla ya existe (por fecha aproximada)
                const fechaRango = new Date(datosLimpios.fecha.getTime() - 60000); // 1 minuto antes
                const fechaRangoFin = new Date(datosLimpios.fecha.getTime() + 60000); // 1 minuto después
                
                const batallaExistente = await Batalla.findOne({
                    fecha: {
                        $gte: fechaRango,
                        $lte: fechaRangoFin
                    }
                });
                
                if (batallaExistente) {
                    console.log(`⚠️  Batalla ya existe, saltando: ${datosLimpios.fecha}`);
                    continue;
                }
                
                const nuevaBatalla = new Batalla(datosLimpios);
                await nuevaBatalla.save();
                batallasNuevas++;
                console.log(`✅ Batalla migrada: ${datosLimpios.ganador || 'Sin ganador'} - ${datosLimpios.fecha} - Iniciador: ${datosLimpios.iniciador}`);
                
            } catch (error) {
                console.error(`❌ Error migrando batalla:`, error.message);
                console.error(`📋 Datos de la batalla:`, JSON.stringify(batallaData, null, 2));
                errores++;
            }
        }
        
        console.log('\\n📋 Resumen de migración:');
        console.log(`✅ Batallas nuevas: ${batallasNuevas}`);
        console.log(`🔄 Batallas actualizadas: ${batallasActualizadas}`);
        console.log(`❌ Errores: ${errores}`);
        
        // Crear backup del archivo JSON original
        if (batallasNuevas > 0 || batallasActualizadas > 0) {
            const backupPath = `./data/batallas_backup_${Date.now()}.json`;
            await fs.copy(BATALLAS_FILE, backupPath);
            console.log(`💾 Backup creado: ${backupPath}`);
        }
        
        console.log('\\n🎉 Migración completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        throw error;
    }
}

async function verificarMigracion() {
    try {
        await connectDB();
        
        const totalBatallas = await Batalla.countDocuments();
        const batallasPorEstado = await Batalla.aggregate([
            { $group: { _id: '$estado', count: { $sum: 1 } } }
        ]);
        const batallasPorGanador = await Batalla.aggregate([
            { $group: { _id: '$ganador', count: { $sum: 1 } } }
        ]);
        
        console.log('\\n📊 Verificación de migración:');
        console.log(`📈 Total de batallas en MongoDB: ${totalBatallas}`);
        console.log('📊 Batallas por estado:', batallasPorEstado);
        console.log('🏆 Batallas por ganador:', batallasPorGanador);
        
        // Mostrar algunas batallas recientes
        const batallasRecientes = await Batalla.find()
            .sort({ fecha: -1 })
            .limit(3)
            .select('ganador estado fecha equipoHeroes.nombreEquipo equipoVillanos.nombreEquipo');
        
        console.log('\\n🕐 Batallas recientes:');
        batallasRecientes.forEach((batalla, index) => {
            console.log(`${index + 1}. ${batalla.equipoHeroes.nombreEquipo} vs ${batalla.equipoVillanos.nombreEquipo}`);
            console.log(`   Ganador: ${batalla.ganador || 'Sin definir'} | Estado: ${batalla.estado} | Fecha: ${batalla.fecha}`);
        });
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
    }
}

// Ejecutar migración
if (process.argv.includes('--migrate')) {
    migrarBatallasAMongoDB()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('❌ Error en migración:', error);
            process.exit(1);
        });
}

// Verificar migración
if (process.argv.includes('--verify')) {
    verificarMigracion()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('❌ Error en verificación:', error);
            process.exit(1);
        });
}

// Por defecto, hacer ambas
if (process.argv.length === 2) {
    (async () => {
        await migrarBatallasAMongoDB();
        await verificarMigracion();
        process.exit(0);
    })().catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}

export { migrarBatallasAMongoDB, verificarMigracion };
