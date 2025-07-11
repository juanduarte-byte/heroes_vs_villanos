import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const EQUIPOS_PATH = './data/equipos.json';

function loadEquipos() {
  if (!fs.existsSync(EQUIPOS_PATH)) return [];
  const data = fs.readFileSync(EQUIPOS_PATH, 'utf-8');
  return data ? JSON.parse(data) : [];
}

function saveEquipos(equipos) {
  fs.writeFileSync(EQUIPOS_PATH, JSON.stringify(equipos, null, 2));
}

export function crearEquipo({ nombre, miembros }) {
  const equipos = loadEquipos();
  const equipo = { id: uuidv4(), nombre, miembros };
  equipos.push(equipo);
  saveEquipos(equipos);
  return equipo;
}

export function getEquipos() {
  return loadEquipos();
}

export function getEquipoById(id) {
  const equipos = loadEquipos();
  return equipos.find(e => e.id === id);
} 