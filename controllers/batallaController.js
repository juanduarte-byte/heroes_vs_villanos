import express from 'express';
import { 
    crearBatalla, 
    iniciarBatalla, 
    realizarAtaque, 
    obtenerEstadoBatalla, 
    obtenerBatallasActivas,
    obtenerHistorialBatallas,
    obtenerEstadisticasBatallas,
    simularBatallaCompleta,
    probarSistema,
    obtenerInfoBatalla
} from '../services/batallaService.js';

const router = express.Router();

// Crear una nueva batalla
router.post('/crear', async (req, res) => {
    try {
        const { equipoHeroes, equipoVillanos, iniciador = 'heroes' } = req.body;
        
        if (!equipoHeroes || !equipoVillanos) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren equipoHeroes y equipoVillanos'
            });
        }

        const resultado = await crearBatalla(equipoHeroes, equipoVillanos, iniciador);
        
        if (resultado.success) {
            res.status(201).json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Iniciar una batalla
router.post('/:batallaId/iniciar', async (req, res) => {
    try {
        const { batallaId } = req.params;
        const resultado = await iniciarBatalla(batallaId);
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Realizar un ataque en una batalla
router.post('/:batallaId/atacar', async (req, res) => {
    try {
        const { batallaId } = req.params;
        const { atacanteId, objetivoId, tipoAtaque } = req.body;
        
        if (!atacanteId || !objetivoId || !tipoAtaque) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren atacanteId, objetivoId y tipoAtaque'
            });
        }

        const resultado = await realizarAtaque(batallaId, atacanteId, objetivoId, tipoAtaque);
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtener información detallada de una batalla (incluye IDs únicos)
router.get('/:batallaId/info', async (req, res) => {
    try {
        const { batallaId } = req.params;
        const resultado = await obtenerInfoBatalla(batallaId);
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(404).json(resultado);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtener estado de una batalla
router.get('/:batallaId/estado', async (req, res) => {
    try {
        const { batallaId } = req.params;
        const resultado = await obtenerEstadoBatalla(batallaId);
        
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(404).json(resultado);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtener batallas activas
router.get('/activas', async (req, res) => {
    try {
        const resultado = await obtenerBatallasActivas();
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtener historial de batallas
router.get('/historial', async (req, res) => {
    try {
        const resultado = await obtenerHistorialBatallas();
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtener estadísticas de batallas
router.get('/estadisticas', async (req, res) => {
    try {
        const resultado = await obtenerEstadisticasBatallas();
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Simular una batalla completa (para pruebas)
router.post('/simular', async (req, res) => {
    try {
        const { equipoHeroes, equipoVillanos, iniciador = 'heroes' } = req.body;
        
        if (!equipoHeroes || !equipoVillanos) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren equipoHeroes y equipoVillanos'
            });
        }

        const resultado = await simularBatallaCompleta(equipoHeroes, equipoVillanos, iniciador);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Probar el sistema completo
router.post('/probar', async (req, res) => {
    try {
        const resultado = await probarSistema();
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router; 