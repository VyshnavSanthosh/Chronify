export default class HomeController {
    constructor(productService) {
        this.productService = productService
    }

    async renderHomePage(req, res) {
        try {
            const products = await this.productService.getHomePageProducts()
            return res.render("home", {
                products
            })
        } catch (error) {
            console.log("Couldn't load home page", error)
        }
    }
}