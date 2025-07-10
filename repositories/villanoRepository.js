import fs from 'fs';
import Villano from '../models/villanoModel.js';

const VILLANOS_FILE = './data/villanos.json';

async function getVillanos() {
  const data = await fs.promises.readFile(VILLANOS_FILE, 'utf-8');
  return JSON.parse(data).map(v => new Villano(v.id, v.name, v.alias, v.city, v.team));
}

async function saveVillanos(villanos) {
  await fs.promises.writeFile(VILLANOS_FILE, JSON.stringify(villanos, null, 2));
}

async function getVillanoById(id) {
  const villanos = await getVillanos();
  return villanos.find(v => v.id === parseInt(id));
}

export default {
  getVillanos,
  saveVillanos,
  getVillanoById
};
