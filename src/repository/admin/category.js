const Category = require("../../models/admin/categorySchema")

module.exports = class CategoryRepository {
    
    async findByName(categoryName){
        return await Category.findOne({categoryName})
    }

    async findById(categoryId){
        return await Category.findById(categoryId)
    }
    async getAllCategories(limit, skip, sortOrder, search, status,sortField){
        const query = {}
        if (status == "true") {
            query.isListed = true
        }
        else if (status == "false") {
            query.isListed = false
        }

        if (search) {
            query.categoryName = { $regex: search, $options: "i"}
        }

        const sortObj = {}
        sortObj[sortField] = sortOrder;

        const categories = await Category.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
        
        const totalCategories = await Category.countDocuments(query)
        
        return {categories, totalCategories}
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

    async updatedCategoryListingStatus(categoryId, isListed){
        try {
            const updatedCategory = await Category.findByIdAndUpdate(
                categoryId,
                { isListed: isListed },
                { new: true }
                )
            return updatedCategory
        } catch (error) {
            throw new Error(`Error updating category listing status: ${error.message}`)
        }
    }

    async editCategoryinDb(categoryId,categoryObj){
        try {
            await Category.findByIdAndUpdate(
                categoryId,
                { $set: categoryObj },
                { new: true, runValidators: true }
            )
        } catch (error) {
            throw new Error("Problem while updating in db", error);
            
        }
    }
}
