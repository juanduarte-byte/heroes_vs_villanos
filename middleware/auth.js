import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import User from '../models/userModel.js';

/**
 * Middleware para autenticar requests usando JWT
 * Verifica que el usuario esté autenticado y adjunta la info del usuario al request
 */
export const authenticateToken = async (req, res, next) => {
    try {
        console.log('\n🔐 === VERIFICANDO AUTENTICACIÓN ===');
        
        // Extraer token del header Authorization
        const authHeader = req.headers.authorization;
        console.log(`📥 Authorization Header recibido: ${authHeader ? authHeader.substring(0, 50) + '...' : 'NO ENCONTRADO'}`);
        
        const token = extractTokenFromHeader(authHeader);
        console.log(`🎫 Token extraído: ${token ? token.substring(0, 30) + '...' : 'NO EXTRAÍDO'}`);
        
        if (!token) {
            console.log('❌ ERROR: No se encontró token válido');
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido. Por favor inicia sesión.'
            });
        }
        
        // Verificar y decodificar el token
        const decoded = verifyToken(token);
        
        // Buscar el usuario en la base de datos
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no válido o cuenta desactivada.'
            });
        }
        
        // Adjuntar información del usuario al request
        req.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email
        };
        
        console.log(`✅ AUTENTICACIÓN EXITOSA - Usuario: ${user.username} (${user.email})`);
        next();
    } catch (error) {
        console.log(`❌ ERROR EN AUTENTICACIÓN: ${error.message}`);
        
        if (error.message === 'Token inválido o expirado') {
            return res.status(401).json({
                success: false,
                error: 'Token inválido o expirado. Por favor inicia sesión nuevamente.'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Error en la autenticación.'
        });
    }
};

/**
 * Middleware opcional para autenticación - no falla si no hay token
 * Útil para endpoints que pueden funcionar con o sin autenticación
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);
        
        if (!token) {
            req.user = null;
            return next();
        }
        
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
            req.user = {
                id: user._id.toString(),
                username: user.username,
                email: user.email
            };
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        // En caso de error, simplemente continuar sin usuario
        req.user = null;
        next();
    }
};
