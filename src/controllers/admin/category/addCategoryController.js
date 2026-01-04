module.exports = class AddCategoryController {
    constructor(addCategoryService, joi_category, validator) {
        this.addCategoryService = addCategoryService
        this.joi_category = joi_category
        this.validator = validator
    }

    renderAddCategoryPage(req,res){
        try {
            return res.render("admin/category/addCategory");
            } 
        catch (error) {
                console.error("Render add category page error:", error);
                return res.status(500).render("error", {
                    message: "Unable to load add category page"
                });
            }
    }

    async handleAddCategory(req,res){
        const { error, value } = this.validator.validate(this.joi_category,req.body)

        const errors = {}

        if (error) {
            error.details.forEach((detail) => {
                errors[detail.context.key] = detail.message
            });

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }

        const categoryObj =  {...value}

        console.log("controller",categoryObj)
        
        try {
            const category = await this.addCategoryService.saveCategoryToDb(categoryObj)

        } catch (error) {
            
        }
        
        

    }
}