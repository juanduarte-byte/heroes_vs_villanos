import jwt from 'jsonwebtoken';

// Obtener el secreto JWT de las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_super_secreto_temporal_cambiar_en_produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generar un token JWT para un usuario
 * @param {Object} user - Objeto usuario con id, username, email
 * @returns {String} - Token JWT
 */
export const generateToken = (user) => {
    const payload = {
        id: user._id || user.id,
        username: user.username,
        email: user.email
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: JWT_EXPIRES_IN 
    });
};

/**
 * Verificar y decodificar un token JWT
 * @param {String} token - Token JWT a verificar
 * @returns {Object} - Payload decodificado del token
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};

/**
 * Extraer token del header Authorization
 * @param {String} authHeader - Header Authorization
 * @returns {String|null} - Token extraído o null
 */
export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    return authHeader.substring(7); // Remover "Bearer " del inicio
};
