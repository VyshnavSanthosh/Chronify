module.exports = class AddCategoryController {
    constructor(addCategoryService, joi_category, validator) {
        this.addCategoryService = addCategoryService
        this.joi_category = joi_category
        this.validator = validator
    }

    renderAddCategoryPage(req,res){
        try {
            return res.status(200).render("admin/category/addCategory",{
                errors: {},
                categoryName: "",
                description: "",
                discountType: "",
                discountValue: "",
                maxRedeemable: ""
            });
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

            return res.status(400).render("admin/category/addCategory",{
                errors,
                categoryName: value.categoryName || "",
                description: value.description || "",
                isListed: value.isListed || "",
                discountType: value.discountType || "",
                discountValue: value.discountValue || "",
                maxRedeemable: value.maxRedeemable || "",
            })
        }

        const categoryObj =  {...value}
        
        try {
            const savedCategory = await this.addCategoryService.saveCategoryToDb(categoryObj)
            return res.status(201).redirect("/admin/category");
        } catch (error) {
            errors.general = error.message
            return res.status(500).render("admin/category/addCategory",{
                errors,
                categoryName: req.body?.categoryName || "",
                description: req.body?.description || "",
                discountType: req.body?.discountType || "",
                discountValue: req.body?.discountValue || "",
                maxRedeemable: req.body?.maxRedeemable || "",
            })
        }
        
        

    }
}