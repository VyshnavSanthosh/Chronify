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

    async getCategoriesList(search, page, status, sort){
        const limit = 10;
        const skip = (page - 1) * limit

        let sortOrder = -1
        let sortField = "createdAt"
        if (sort == "za") {
            sortOrder = -1
        }
        else if (sort == "az") {
            sortOrder = 1
        }

        const {categories, totalCategories} = await this.categoryRepository.getAllCategories(limit, skip, sortOrder, search, status,sortField)

        return {categories,totalCategories}
    }

    async toggleCategoryListingStatus(categoryId, isListed){
        const updatedCategory = await this.categoryRepository.updatedCategoryListingStatus(categoryId, isListed)
        
        return updatedCategory
    }

    async findCategory(categoryId){
        const category = await this.categoryRepository.findById(categoryId)
        return category
    }
    
    async editCategory(categoryObj){
        const categoryExits = await this.categoryRepository.findByName(categoryObj.categoryName)
        
        await this.categoryRepository.editCategoryinDb(categoryExits._id,categoryObj)
    }
}