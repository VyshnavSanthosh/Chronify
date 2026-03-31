import Wishlist from "../../models/user/wishlistSchema.js"

export default class WishListRepository {
    async saveProductInDb(productId, userId, sku) {
        try {
            const wishList = await Wishlist.create({
                userId: userId,
                productId: productId,
                sku: sku
            })
            return wishList
        } catch (error) {
            console.log("Couldn't save wishList data in db DB error", error)
        }
    }

    async deleteProductFromDb(productId, userId) {
        try {
            return await Wishlist.findOneAndDelete(
                { userId: userId, productId: productId })
        } catch (error) {
            console.log("Couldn't delete product from WishList : ", error)
        }
    }

    async deleteWishlistItemById(wishlistItemId) {
        try {
            return await Wishlist.findByIdAndDelete(wishlistItemId);
        } catch (error) {
            console.log("Couldn't delete wishlist item by ID: ", error);
        }
    }

    async getAllItemsByUserId(userId) {
        try {
            const result = await Wishlist.find({ userId: userId }).populate({
                path: "productId",
                select: "name brand vendorId isListed isDeleted variants.price variants.offer variants.mainImage variants.sku category",
                populate: [
                    {
                        path: "category",
                        select: "isListed discountValue categoryName"
                    },
                    {
                        path: "vendorId",
                        select: "isBlocked"
                    }
                ]
            })


            return result
        } catch (error) {
            console.log("Couldn't get wishlist products from db", error)
            return []
        }
    }

    async getItemById(userId, productId) {
        try {
            const result = await Wishlist.findOne({ userId: userId, productId: productId })
            return result

        } catch (error) {
            console.log("Couldn't get wishlit item from db")

        }
    }
}