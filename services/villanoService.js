import villanoRepository from '../repositories/villanoRepository.js';

async function getAllVillanos() {
  return await villanoRepository.getVillanos();
}

async function addVillano(villano) {
  if (!villano.name || !villano.alias) {
    throw new Error('El villano debe tener un nombre y un alias.');
  }
  const villanos = await villanoRepository.getVillanos();
  const newId = villanos.length > 0 ? Math.max(...villanos.map(v => v.id)) + 1 : 1;
  const newVillano = { ...villano, id: newId };
  villanos.push(newVillano);
  await villanoRepository.saveVillanos(villanos);
  return newVillano;
}

async function updateVillano(id, updatedVillano) {
  const villanos = await villanoRepository.getVillanos();
  const index = villanos.findIndex(v => v.id === parseInt(id));
  if (index === -1) {
    throw new Error('Villano no encontrado');
  }
  delete updatedVillano.id;
  villanos[index] = { ...villanos[index], ...updatedVillano };
  await villanoRepository.saveVillanos(villanos);
  return villanos[index];
}

async function deleteVillano(id) {
  const villanos = await villanoRepository.getVillanos();
  const index = villanos.findIndex(v => v.id === parseInt(id));
  if (index === -1) {
    throw new Error('Villano no encontrado');
  }
  const filteredVillanos = villanos.filter(v => v.id !== parseInt(id));
  await villanoRepository.saveVillanos(filteredVillanos);
  return { message: 'Villano eliminado' };
}

export default {
  getAllVillanos,
  addVillano,
  updateVillano,
  deleteVillano
};
