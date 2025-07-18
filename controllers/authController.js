import express from 'express';
import { check, validationResult } from 'express-validator';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../services/authService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register - Registrar nuevo usuario
 */
router.post('/register', [
    check('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    check('email')
        .isEmail()
        .withMessage('Por favor ingresa un email válido')
        .normalizeEmail(),
    check('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número')
], async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Datos de entrada inválidos',
                details: errors.array()
            });
        }

        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/login - Iniciar sesión
 */
router.post('/login', [
    check('email')
        .isEmail()
        .withMessage('Por favor ingresa un email válido')
        .normalizeEmail(),
    check('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
], async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Datos de entrada inválidos',
                details: errors.array()
            });
        }

        const result = await loginUser(req.body);
        res.json(result);
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/auth/profile - Obtener perfil del usuario actual
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await getUserProfile(req.user.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/auth/profile - Actualizar perfil del usuario
 */
router.put('/profile', authenticateToken, [
    check('username')
        .optional()
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos')
], async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Datos de entrada inválidos',
                details: errors.array()
            });
        }

        const result = await updateUserProfile(req.user.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/auth/logout - Cerrar sesión (opcional - el cliente simplemente elimina el token)
 */
router.post('/logout', authenticateToken, (req, res) => {
    // En JWT, el logout se maneja en el cliente eliminando el token
    // Aquí solo confirmamos el logout
    res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
});

export default router;
