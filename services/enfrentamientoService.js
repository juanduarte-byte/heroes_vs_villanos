import { getAllEnfrentamientos, saveEnfrentamiento } from '../repositories/enfrentamientoRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import villanoRepository from '../repositories/villanoRepository.js';

export async function enfrentarHeroeVillano({ heroeId, villanoId, tipo, retadorName }) {
  // tipo: 'heroe' o 'villano' (quién inicia el reto)
  const heroe = await heroRepository.getHeroeById(Number(heroeId));
  const villano = await villanoRepository.getVillanoById(Number(villanoId));
  if (!heroe || !villano) return { error: 'Héroe o villano no encontrado' };

  // Validar que no sea del mismo tipo
  if (heroeId == villanoId) return { error: 'No se puede enfrentar el mismo personaje.' };

  // Lógica simple: ganador aleatorio
  const ganador = Math.random() < 0.5 ? heroe : villano;
  const perdedor = ganador === heroe ? villano : heroe;

  const resultado = {
    fecha: new Date().toISOString(),
    heroe: { id: heroe.id, nombre: heroe.name, alias: heroe.alias },
    villano: { id: villano.id, nombre: villano.name, alias: villano.alias },
    ganador: ganador.alias,
    perdedor: perdedor.alias,
    iniciadoPor: tipo,
    retador: retadorName
  };
  saveEnfrentamiento(resultado);
  return resultado;
}
