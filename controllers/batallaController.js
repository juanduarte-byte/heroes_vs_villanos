
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
    obtenerInfoBatalla,
    activarSuperAtaque,
    activarSuperDefensa,
    usarHabilidad
} from '../services/batallaService.js';
import { authenticateToken } from '../middleware/auth.js';
import { verifyBattleOwnership, verifyActiveBattleOwnership } from '../middleware/battleOwnership.js';

const router = express.Router();

// Activar superataque
router.post('/:batallaId/activar-superataque', authenticateToken, verifyActiveBattleOwnership, async (req, res) => {
    try {
        const { batallaId } = req.params;
        const { personajeId } = req.body;
        if (!personajeId) {
            return res.status(400).json({ success: false, error: 'Se requiere personajeId' });
        }
        const resultado = await activarSuperAtaque(batallaId, personajeId);
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Activar superdefensa
router.post('/:batallaId/activar-superdefensa', authenticateToken, verifyActiveBattleOwnership, async (req, res) => {
    try {
        const { batallaId } = req.params;
        const { personajeId } = req.body;
        if (!personajeId) {
            return res.status(400).json({ success: false, error: 'Se requiere personajeId' });
        }
        const resultado = await activarSuperDefensa(batallaId, personajeId);
        if (resultado.success) {
            res.json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Usar habilidad especial
router.post('/:batallaId/usar-habilidad', authenticateToken, verifyActiveBattleOwnership, async (req, res) => {
    try {
        const { batallaId } = req.params;
        const { personajeId, objetivoId } = req.body;
        
        if (!personajeId) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere personajeId'
            });
        }

        const resultado = await usarHabilidad(batallaId, personajeId, objetivoId);
        
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

// Crear una nueva batalla
router.post('/crear', authenticateToken, async (req, res) => {
    try {
        const { equipoHeroes, equipoVillanos, iniciador = 'heroes', primerHeroe = null, primerVillano = null } = req.body;
        const userId = req.user.id;
        
        if (!equipoHeroes || !equipoVillanos) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren equipoHeroes y equipoVillanos'
            });
        }

        const resultado = await crearBatalla(equipoHeroes, equipoVillanos, iniciador, primerHeroe, primerVillano, userId);
        
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
router.post('/:batallaId/iniciar', authenticateToken, verifyBattleOwnership, async (req, res) => {
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
router.post('/:batallaId/atacar', authenticateToken, verifyActiveBattleOwnership, async (req, res) => {
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
router.get('/:batallaId/info', authenticateToken, verifyBattleOwnership, async (req, res) => {
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
router.get('/:batallaId/estado', authenticateToken, verifyBattleOwnership, async (req, res) => {
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
router.get('/activas', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const resultado = await obtenerBatallasActivas(userId);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtener historial de batallas
router.get('/historial', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const resultado = await obtenerHistorialBatallas(userId);
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
        const { equipoHeroes, equipoVillanos, iniciador = 'heroes', primerHeroe = null, primerVillano = null } = req.body;
        
        if (!equipoHeroes || !equipoVillanos) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren equipoHeroes y equipoVillanos'
            });
        }

        const resultado = await simularBatallaCompleta(equipoHeroes, equipoVillanos, iniciador, primerHeroe, primerVillano);
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