const { exists } = require("../../../models/admin/categorySchema")

module.exports = class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository
    }

    async saveCategoryToDb(categoryObj) {
        
        const exist = await this.categoryRepository.findByName(categoryObj.categoryName)
        if (exists) {
            throw new Error("Category already exists");
        }
        try {
            const category = await this.categoryRepository.save(categoryObj)
            await this.categoryRepository.save(categoryObj)
        } catch (error) {
            
        }
    }
}