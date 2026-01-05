module.exports = class AddProductService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository
    }

    async getAllCategories(){
        const categories = await this.categoryRepository.getAllCategies()

        return categories
    }
}