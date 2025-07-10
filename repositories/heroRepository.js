import fs from 'fs-extra'
import Hero from '../models/heroModel.js'

const filePath = './data/superheroes.json' // Verificar la ruta que tu configuraste en tu proyecto.

async function getHeroes() {
    try {
        const data = await fs.readJson(filePath)
        return data.map(hero => new Hero(
            hero.id, hero.name, hero.alias, hero.city, hero.team
        ))
    } catch (error) {
        console.error(error)
    }

}

async function saveHeroes(heroes) {
    try {
        await fs.writeJson(filePath, heroes)
    } catch (error) {
        console.error(error)
    }
}

async function getHeroeById(id) {
    const heroes = await getHeroes();
    return heroes.find(h => h.id === parseInt(id));
}

export default {
    getHeroes,
    saveHeroes,
    getHeroeById
}