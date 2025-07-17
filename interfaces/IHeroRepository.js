/**
 * Interface para Repository de Héroes
 * Define el contrato que debe cumplir cualquier implementación
 */
export class IHeroRepository {
    async findAll() {
        throw new Error('Method findAll must be implemented');
    }
    
    async findById(id) {
        throw new Error('Method findById must be implemented');
    }
    
    async create(heroData) {
        throw new Error('Method create must be implemented');
    }
    
    async update(id, heroData) {
        throw new Error('Method update must be implemented');
    }
    
    async delete(id) {
        throw new Error('Method delete must be implemented');
    }
}
