import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    alias: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    team: {
        type: String,
        required: true,
        trim: true
    },
    powerLevel: {
        type: Number,
        default: 100
    },
    defenseLevel: {
        type: Number,
        default: 100
    }
}, {
    timestamps: true
});

export default mongoose.model('Hero', heroSchema);