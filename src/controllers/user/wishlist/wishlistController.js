export default class WishListController {
    constructor(wishListService) {
        this.wishListService = wishListService
    }
    async renderWishListPage(req, res) {
        const user = req.user
        try {
            const { wishlist, removedItemsCount } = await this.wishListService.getAllItems(user._id)

            if (removedItemsCount > 0) {
                return res.redirect("/products?blocked=true")
            }

            return res.render("user/wishList", {
                user,
                wishlist,
                removedItemsCount
            })
        } catch (error) {
            console.log("Couldn't Load wish-list page ", error.message)
        }
    }

    async addToWishList(req, res) {
        const { productId } = req.params
        const userId = req.user._id
        const sku = req.query.sku

        try {
            await this.wishListService.saveProduct(productId, userId, sku)
            return res.status(200).json({ success: true, message: "Product added to wishlist" })
        } catch (error) {
            console.log("Couldn't save product in WishList : ", error.message)
            return res.status(500).json({ success: false, message: "Internal Server Error" })
        }
    }

    async removeFromWishlist(req, res) {
        const { productId } = req.params
        const userId = req.user._id
        try {
            await this.wishListService.deleteProduct(productId, userId)
            return res.status(200).json({ success: true, message: "Product removed from wishlist" })
        } catch (error) {
            console.log("Couldn't delete product from WishList : ", error.message)
            return res.status(500).json({ success: false, message: "Internal Server Error" })
        }
    }
}