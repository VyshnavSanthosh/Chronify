import Cart from "../../models/user/cartSchema.js";
import Product from "../../models/vendor/productSchema.js"
export default class CartRepository {
    async saveInDb(userId, productObj) {
        try {

            let cart = await Cart.findOne({ userId })
            if (!cart) {
                cart = await Cart.create({
                    userId: userId,
                    items: [productObj]
                })
                return cart
            }

            const existingProduct = cart.items.find((item) => {
                return item.sku == productObj.sku
            })

            if (existingProduct) {
                if (existingProduct.qty + productObj.qty > productObj.stock) {
                    throw new Error("Insufficient stock available")
                }
                existingProduct.qty += productObj.qty
            }
            else {
                if (productObj.qty > productObj.stock) {
                    throw new Error("Insufficient stock available")
                }
                cart.items.push(productObj)
            }
            await cart.save()

            return cart

        } catch (error) {
            console.error("Error saving cart to DB:", error);
            throw error
        }
    }

    async getAllItemsByUserId(userId) {
        const cart = await Cart.findOne({ userId: userId })
            .populate({
                path: "items.productId",
                select: "name brand vendorId isListed isDeleted variants.price variants.mainImage variants.quantity variants.offer variants.color variants.sku category",
                populate: [
                    {
                        path: "category",
                        select: "isListed discountValue"
                    },
                    {
                        path: "vendorId",
                        select: "isBlocked"
                    }
                ]
            })
            .lean()
        const count = cart?.items?.length || 0
        return { cart, count }
    }

    async getAllItemsByUserIdClean(userId) {
        const cart = await Cart.find({ userId: userId })
            .lean()
        return cart
    }

    async findBySku(userId, sku) {
        try {
            return await Cart.findOne({ userId, "items.sku": sku })
                .lean()
        } catch (error) {
            console.log("Couldn't get item ", error)

        }

    }

    async incrementQty(sku, userId) {
        try {
            const cart = await Cart.findOneAndUpdate(
                {
                    userId: userId,
                    "items.sku": sku
                },
                {
                    $inc: { "items.$.qty": 1 }
                },
                { new: true })

            if (!cart) {
                throw new Error("Product not found in cart")
            }
            return cart
        } catch (error) {
            console.log("Counld't update qunatity : ", error)

        }
    }
    async decrementQty(sku, userId) {
        try {
            const cart = await Cart.findOneAndUpdate(
                {
                    userId: userId,
                    "items.sku": sku
                },
                {
                    $inc: { "items.$.qty": -1 }
                },
                { new: true })

            if (!cart) {
                throw new Error("Product not found in cart")
            }
            return cart
        } catch (error) {
            console.log("Counld't update qunatity : ", error)

        }
    }

    async deleteItemFromCart(userId, sku) {
        try {
            const cart = await Cart.findOneAndUpdate(
                { userId: userId },
                { $pull: { items: { sku: sku } } },
                { new: true }
            )

            if (cart && cart.items.length === 0) {
                await Cart.deleteOne({ userId: userId })
                return null
            }
            return cart
        } catch (error) {
            console.log("Couldn't delete item from cart : ", error)
        }
    }

    async clearCart(userId) {
        try {
            return await Cart.deleteOne({ userId })
        } catch (error) {
            console.log("Couldn't delete cart collection")
        }
    }

    async removeItemsFromCart(userId, skus) {
        try {
            const cart = await Cart.findOneAndUpdate(
                { userId: userId },
                { $pull: { items: { sku: { $in: skus } } } },
                { new: true }
            );

            if (cart && cart.items.length === 0) {
                await Cart.deleteOne({ userId: userId })
                return null
            }
            return cart;
        } catch (error) {
            console.log("Couldn't remove items from cart:", error);
            throw error;
        }
    }

    async getProductBySku(sku) {
        try {
            return await Product.findOne({ "variants.sku": sku }).lean()
        } catch (error) {
            console.log("Couldn't get the product")

        }
    }
}