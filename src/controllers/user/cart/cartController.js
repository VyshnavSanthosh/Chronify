export default class CartControler {
    constructor(cartService) {
        this.cartService = cartService
    }
    async renderCartPage(req, res) {
        const user = req.user
        try {
            const { cart, total, count, removedItemsCount } = await this.cartService.getCartItems(user._id)
            console.log("Count :", count)

            return res.render("user/cart", {
                user,
                cart,
                total,
                cartCount: count,
                removedItemsCount
            })
        } catch (error) {
            console.log("Couldn't load cart page ", error)
        }
    }

    async addToCart(req, res) {
        const userId = req.user._id
        const { sku } = req.params
        const { productId } = req.params
        try {
            const cart = await this.cartService.saveItemInCart(userId, productId, sku)
            return res.json({
                success: true,
                message: "Item added to cart",
                cart
            })
        } catch (error) {
            console.error("Error adding to cart:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to add to cart"
            })
        }
    }

    async addToCartFromWishList(req, res) {
        const userId = req.user._id
        const { productId } = req.params
        try {
            const cart = await this.cartService.saveItemFromWishListToCart(userId, productId)
            return res.json({
                success: true,
                message: "Item added to cart",
                cart
            })
        } catch (error) {
            console.error("Error adding from wishlist to cart:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to add to cart"
            })
        }
    }
    async delteFromCart(req, res) {
        const userId = req.user._id
        const { sku } = req.params
        console.log("SKU :", sku)
        try {
            await this.cartService.deleteItemFromCart(userId, sku)
            return res.json({
                success: true,
            })
        } catch (error) {
            console.error("Error deleting item from cart:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to delete item"
            })
        }
    }

    async incrementQty(req, res) {
        const { sku } = req.params
        const userId = req.user._id
        try {
            await this.cartService.incrementQty(sku, userId)
            return res.json({
                success: true,
            })
        } catch (error) {
            console.error("Error incrementing quantity:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to increment quantity"
            })
        }
    }

    async decrementQty(req, res) {
        const { sku } = req.params
        const userId = req.user._id
        try {
            await this.cartService.decrementQty(sku, userId)
            return res.json({
                success: true,
            })
        } catch (error) {
            console.error("Error decrementing quantity:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to decrement quantity"
            })
        }
    }
}