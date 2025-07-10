import fs from 'fs';

const ENFRENTAMIENTOS_PATH = './data/enfrentamientos.json';

export function getAllEnfrentamientos() {
  if (!fs.existsSync(ENFRENTAMIENTOS_PATH)) return [];
  const data = fs.readFileSync(ENFRENTAMIENTOS_PATH);
  return JSON.parse(data);
}

export function saveEnfrentamiento(enfrentamiento) {
  const enfrentamientos = getAllEnfrentamientos();
  enfrentamientos.push(enfrentamiento);
  fs.writeFileSync(ENFRENTAMIENTOS_PATH, JSON.stringify(enfrentamientos, null, 2));
}
