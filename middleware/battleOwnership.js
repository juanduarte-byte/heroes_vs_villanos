import { batallasActivas } from '../services/batallaService.js';

/**
 * Middleware para verificar que el usuario sea dueño de la batalla
 * Debe usarse después de authenticateToken
 */
export const verifyBattleOwnership = (req, res, next) => {
    try {
        const { batallaId } = req.params;
        const userId = req.user.id;
        
        if (!batallaId) {
            return res.status(400).json({
                success: false,
                error: 'ID de batalla requerido'
            });
        }
        
        // Buscar batalla en batallas activas
        const batalla = batallasActivas.get(batallaId);
        
        if (!batalla) {
            return res.status(404).json({
                success: false,
                error: 'Batalla no encontrada o ya finalizada'
            });
        }
        
        // Verificar ownership
        if (batalla.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para acceder a esta batalla'
            });
        }
        
        // Adjuntar batalla al request para evitar búsquedas repetidas
        req.batalla = batalla;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error verificando permisos de batalla'
        });
    }
};

/**
 * Middleware más específico para operaciones que requieren batalla activa
 */
export const verifyActiveBattleOwnership = (req, res, next) => {
    try {
        const { batallaId } = req.params;
        const userId = req.user.id;
        
        // Buscar batalla en batallas activas
        const batalla = batallasActivas.get(batallaId);
        
        if (!batalla) {
            return res.status(404).json({
                success: false,
                error: 'Batalla no encontrada o ya finalizada'
            });
        }
        
        // Verificar ownership
        if (batalla.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para acceder a esta batalla'
            });
        }
        
        // Verificar que la batalla esté activa
        if (batalla.estado === 'finalizada') {
            return res.status(400).json({
                success: false,
                error: 'No se pueden realizar acciones en una batalla finalizada'
            });
        }
        
        req.batalla = batalla;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Error verificando permisos de batalla'
        });
    }
};
