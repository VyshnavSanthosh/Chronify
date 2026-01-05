const { exists } = require("../../../models/admin/categorySchema")

module.exports = class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository
    }

    async saveCategoryToDb(categoryObj) {
        
        const exists = await this.categoryRepository.findByName(categoryObj.categoryName)

        if (exists) {
            throw new Error("Category already exists");
        }
        try {
            const category = await this.categoryRepository.createCategory(categoryObj)

            return category

        } catch (error) {
            throw error;
        }
    }

}