import express from "express";
import { check, validationResult } from 'express-validator';
import heroService from "../services/heroService.js";

const router = express.Router();

/**
 * ✅ CONTROLLER LIMPIO - Solo maneja HTTP y validaciones
 * No conoce modelos, solo delega al service
 */

router.get("/heroes", async (req, res) => {
    try {
        const heroes = await heroService.getAllHeroes();
        res.json({
            success: true,
            data: heroes,
            message: 'Héroes obtenidos exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.post("/heroes",
    [
        check('name').not().isEmpty().withMessage('El nombre es requerido'),
        check('alias').not().isEmpty().withMessage('El alias es requerido'),
        check('city').not().isEmpty().withMessage('La ciudad es requerida'),
        check('team').not().isEmpty().withMessage('El equipo es requerido')
    ],
    async (req, res) => {
        // ✅ Validación de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        try {
            // ✅ Solo delega al service, no conoce implementación
            const newHero = await heroService.createHero(req.body);
            
            res.status(201).json({
                success: true,
                data: newHero,
                message: 'Héroe creado exitosamente'
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                res.status(400).json({ 
                    success: false, 
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    error: 'Error interno del servidor' 
                });
            }
        }
    }
);

router.put("/heroes/:id", async (req, res) => {
    try {
        const updatedHero = await heroService.updateHero(req.params.id, req.body);
        res.json({
            success: true,
            data: updatedHero,
            message: 'Héroe actualizado exitosamente'
        });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ 
                success: false, 
                error: error.message 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
        }
    }
});

router.delete('/heroes/:id', async (req, res) => {
    try {
        await heroService.deleteHero(req.params.id);
        res.json({
            success: true,
            message: 'Héroe eliminado exitosamente'
        });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            res.status(404).json({ 
                success: false, 
                error: error.message 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
        }
    }
});

export default router;
