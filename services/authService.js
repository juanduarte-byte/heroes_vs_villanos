import User from '../models/userModel.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Registrar un nuevo usuario
 * @param {Object} userData - Datos del usuario (username, email, password)
 * @returns {Object} - Usuario creado y token JWT
 */
export const registerUser = async (userData) => {
    try {
        const { username, email, password } = userData;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            if (existingUser.email === email) {
                throw new Error('Ya existe un usuario con este email');
            }
            if (existingUser.username === username) {
                throw new Error('Ya existe un usuario con este nombre de usuario');
            }
        }
        
        // Crear nuevo usuario
        const newUser = new User({
            username,
            email,
            password // Se hasheará automáticamente por el middleware del schema
        });
        
        await newUser.save();
        
        // Generar token JWT
        const token = generateToken(newUser);
        
        return {
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: newUser.toPublicJSON()
        };
    } catch (error) {
        if (error.code === 11000) {
            // Error de duplicado de MongoDB
            const field = Object.keys(error.keyPattern)[0];
            throw new Error(`Ya existe un usuario con este ${field}`);
        }
        throw error;
    }
};

/**
 * Iniciar sesión de usuario
 * @param {Object} loginData - Datos de login (email, password)
 * @returns {Object} - Usuario y token JWT
 */
export const loginUser = async (loginData) => {
    try {
        const { email, password } = loginData;
        
        // Buscar usuario por email
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            throw new Error('Email o contraseña incorrectos');
        }
        
        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Email o contraseña incorrectos');
        }
        
        // Actualizar último login
        user.lastLogin = new Date();
        await user.save();
        
        // Generar token JWT
        const token = generateToken(user);
        
        return {
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            user: user.toPublicJSON()
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener perfil del usuario actual
 * @param {String} userId - ID del usuario
 * @returns {Object} - Datos del usuario
 */
export const getUserProfile = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.isActive) {
            throw new Error('Usuario no encontrado');
        }
        
        return {
            success: true,
            user: user.toPublicJSON()
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Actualizar perfil del usuario
 * @param {String} userId - ID del usuario
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object} - Usuario actualizado
 */
export const updateUserProfile = async (userId, updateData) => {
    try {
        const allowedUpdates = ['username'];
        const updates = {};
        
        // Solo permitir actualizaciones de campos específicos
        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = updateData[key];
            }
        });
        
        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        return {
            success: true,
            message: 'Perfil actualizado exitosamente',
            user: user.toPublicJSON()
        };
    } catch (error) {
        throw error;
    }
};
