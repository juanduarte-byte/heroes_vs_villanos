import express from 'express';
import { enfrentarHeroeVillano } from '../services/enfrentamientoService.js';
import heroRepository from '../repositories/heroRepository.js';
import villanoRepository from '../repositories/villanoRepository.js';
import { getAllEnfrentamientos } from '../repositories/enfrentamientoRepository.js';

const router = express.Router();

// Endpoint para consultar el historial de enfrentamientos
router.get('/enfrentamientos', (req, res) => {
    const enfrentamientos = getAllEnfrentamientos();
    res.json(enfrentamientos);
});

export async function enfrentarDesdeHeroe(req, res) {
    const heroeId = req.params.id;
    const { villain } = req.body;
    const villano = await villanoRepository.getVillanoById(Number(villain));
    if (!villano) return res.status(404).json({ error: 'Villano no encontrado' });
    const heroe = await heroRepository.getHeroeById(Number(heroeId));
    const resultado = await enfrentarHeroeVillano({ heroeId, villanoId: villain, tipo: 'heroe', retadorName: heroe?.alias });
    if (resultado.error) return res.status(400).json({ error: resultado.error });
    res.json(resultado);
}

export async function enfrentarDesdeVillano(req, res) {
    const villanoId = req.params.id;
    const { hero } = req.body;
    const heroe = await heroRepository.getHeroeById(Number(hero));
    if (!heroe) return res.status(404).json({ error: 'Héroe no encontrado' });
    const villano = await villanoRepository.getVillanoById(Number(villanoId));
    const resultado = await enfrentarHeroeVillano({ heroeId: hero, villanoId, tipo: 'villano', retadorName: villano?.alias });
    if (resultado.error) return res.status(400).json({ error: resultado.error });
    res.json(resultado);
}

// Rutas para enfrentamientos
router.post('/heroes/:id/enfrentar', enfrentarDesdeHeroe);
router.post('/villanos/:id/enfrentar', enfrentarDesdeVillano);

export default router;
