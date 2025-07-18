import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'El nombre de usuario es requerido'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
        maxlength: [30, 'El nombre de usuario no puede tener más de 30 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
    // Solo hashear si la contraseña ha sido modificada (o es nueva)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash de la contraseña con salt rounds de 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario (sin contraseña)
userSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

export default mongoose.model('User', userSchema);
