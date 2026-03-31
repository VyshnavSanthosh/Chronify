export default class ProductDetailController {
    constructor(productService, wishListService) {
        this.productService = productService;
        this.wishListService = wishListService;
    }

    async renderProductDetailPage(req, res) {
        try {
            const { productId } = req.params
            const product = await this.productService.getProduct(productId)
            
            if (!product || !product.isListed || (product.category && !product.category.isListed) || product.isDeleted || (product.vendorId && product.vendorId.isBlocked)) {
                return res.redirect("/products?message=blocked")
            }

            const relatedProducts = await this.productService.getRelatedProducts(product.brand, product._id)

            let isWishlisted = false;
            if (req.user) {
                const { wishlist } = await this.wishListService.getAllItems(req.user._id);
                isWishlisted = wishlist.some(item => item.productId._id.toString() === productId);
            }

            return res.render("user/products/productDetail", {
                product,
                relatedProducts,
                isWishlisted
            })
        } catch (error) {
            console.log("Couldn't load product detail page", error.message)
        }
    }
}