module.exports = class AddProductController {
    constructor(addProductService) {
        this.addProductService = addProductService
    }

    renderAddProductPage(req,res){
        return res.render("vendor/products/addProduct")
    }

    async handleAddProducts(req,res){
        
    }
}