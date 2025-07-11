import express from 'express';
import { crearEquipo, getEquipos, getEquipoById } from '../repositories/equipoRepository.js';

const router = express.Router();

// Crear equipo
router.post('/equipos', (req, res) => {
  const { nombre, miembros } = req.body;
  if (!nombre || !miembros || !Array.isArray(miembros) || miembros.length === 0) {
    return res.status(400).json({ error: 'Debes enviar un nombre y un array de miembros.' });
  }
  const equipo = crearEquipo({ nombre, miembros });
  res.status(201).json(equipo);
});

// Listar equipos
router.get('/equipos', (req, res) => {
  res.json(getEquipos());
});

// Obtener equipo por id
router.get('/equipos/:id', (req, res) => {
  const equipo = getEquipoById(req.params.id);
  if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado.' });
  res.json(equipo);
});

export default router; 