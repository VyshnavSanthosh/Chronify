module.exports = class categoryListController {
    constructor(categoryListService) {
        this.categoryListService = categoryListService
    }

    async renderCategoryListPage(req,res){
            const search = req.query.search || "";
            const page = parseInt(req.query.page) || 1;
            const status = req.query.status || "";
            const sort = req.query.sort || "";
        try {
            const {categories, totalCategories} = await this.categoryListService.getCategoriesList(search, page, status, sort)
            
            return res.status(200).render("admin/category/categoryLIst",{
                categories,
                totalCategories,
                currentPage: page
            })

        } catch (error) {
            console.error("Render customer page error:", error);
            return res.status(500).render("error", {
                message: "Unable to load add category page"
            });
        }
    }

    async toggleCategoryListing(req, res) {
        try {
            const {categoryId} = req.params
            const {isListed} = req.body
            
            if (!categoryId) {                
                return res.status(400).json({
                    success: false,
                    message: "Category ID is required"
                })
            }

            const updatedCategory = await this.categoryListService.toggleCategoryListingStatus(categoryId, isListed)

            return res.status(200).json({
                success: true,
                message: `Category ${isListed ? 'listed' : 'unlisted'} successfully`,
                category: updatedCategory
            })

        } catch (error) {
            console.error("Toggle category listing error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to update category status"
            });
        }
    }

    async renderEditCategoryPage(req,res){
        const categoryId = req.params.categoryId
        if (!categoryId) {
            throw new Error("Category Id not found");
        }
        const category = await this.categoryListService.findCategory(categoryId)

        return res.status(200).render("admin/category/editCategory",{
            category
        })
    }

    async handleCategoryEdit(req,res){
        const {...categoryObj} = req.body
        console.log("categoryObj",categoryObj)
        
        try {
            await this.categoryListService.editCategory(categoryObj)

            return res.status(200).redirect("/admin/category")
        } catch (error) {
            throw new Error("Couldn't edit category");
        }
        
    }
}