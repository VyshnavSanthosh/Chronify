const Category = require("../../models/admin/categorySchema")

module.exports = class CategoryRepository {
    
    async findByName(categoryName){
        return await Category.findOne({categoryName})
    }

    async getAllCategies(){
        return await Category.find({})
    }
    
    async createCategory(categoryObj){
        try {
            const category = new Category(categoryObj)
            return await category.save()
        } catch (error) {
            // Duplicate key error (MongoDB error code 11000)
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                throw new Error(`${field} already exists`);
            }

            // Re-throw other errors
            throw error;
        }
    }

    async unlistCategory(categoryId){
        return await Category.findByIdAndUpdate(
            categoryId,
            { isListed: false}
        )
    }


}
