import express from "express";
import { check, validationResult } from 'express-validator';
import villanoService from "../services/villanoService.js";
import Villano from "../models/villanoModel.js";
import { enfrentarDesdeVillano } from './enfrentamientoController.js';

const router = express.Router();

router.get("/villanos", async (req, res) => {
    try {
        const villanos = await villanoService.getAllVillanos();
        res.json(villanos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/villanos",
    [
        check('name').not().isEmpty().withMessage('El nombre es requerido'),
        check('alias').not().isEmpty().withMessage('El alias es requerido')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        try {
            const { name, alias, city, team } = req.body;
            const newVillano = new Villano(null, name, alias, city, team);
            const addedVillano = await villanoService.addVillano(newVillano);
            res.status(201).json(addedVillano);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

router.put("/villanos/:id", async (req, res) => {
    try {
        const updatedVillano = await villanoService.updateVillano(req.params.id, req.body);
        res.json(updatedVillano);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.delete('/villanos/:id', async (req, res) => {
    try {
        const result = await villanoService.deleteVillano(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

router.post('/villanos/:id/enfrentar', enfrentarDesdeVillano);

export default router;
