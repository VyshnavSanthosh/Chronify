module.exports = class AddProductController {
    constructor(addProductService) {
        this.addProductService = addProductService
    }

    async renderAddProductPage(req,res){
        try {
            const categories = await this.addProductService.getAllCategories()
            console.log(categories)
            
            return res.render("vendor/products/addProduct",{
                errors: {},
                productName: "",
                description: "",
                categories,
                
                
            })
        } catch (error) {
            console.log("error in loading",error)
            
        }

    }

    async handleAddProducts(req,res){
        
    }
}