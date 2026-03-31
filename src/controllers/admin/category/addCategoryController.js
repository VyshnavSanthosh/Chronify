export default class AddCategoryController {
    constructor(addCategoryService, joi_category, validator) {
        this.addCategoryService = addCategoryService
        this.joi_category = joi_category
        this.validator = validator
    }

    renderAddCategoryPage(req, res) {
        try {
            return res.status(200).render("admin/category/addCategory", {
                errors: {},
                categoryName: "",
                description: "",
                discountType: "percentage",
                discountValue: ""
            });
        }
        catch (error) {
            console.error("Render add category page error:", error);
            return res.status(500).render("error", {
                message: "Unable to load add category page"
            });
        }
    }

    async handleAddCategory(req, res) {
        const { error, value } = this.validator.validate(this.joi_category, req.body)

        if (error) {
            const errors = {}
            error.details.forEach((detail) => {
                errors[detail.context.key] = detail.message
            });

            return res.status(400).json({
                success: false,
                errors,
                message: "Validation failed"
            })
        }

        const categoryObj = { ...value }

        try {
            const savedCategory = await this.addCategoryService.saveCategoryToDb(categoryObj)
            return res.status(201).json({
                success: true,
                message: "Category added successfully",
                redirectUrl: "/admin/category"
            });
        } catch (error) {
            console.log("error saving", error)
            return res.status(500).json({
                success: false,
                message: error.message || "Internal server error"
            })
        }
    }
}