export default class CartService {
    constructor(wishlistRepository, productRepository, cartRepository) {
        this.wishListRepository = wishlistRepository
        this.productRepository = productRepository
        this.cartRepository = cartRepository
    }

    async saveItemInCart(userId, productId, sku) {

        const wishListId = await this.wishListRepository.getItemById(userId, productId)
        if (wishListId) {
            await this.wishListRepository.deleteProductFromDb(productId, userId)
        }
        const product = await this.productRepository.getProductById(productId)
        const productObj = {
            productId: product._id,
        }
        for (const variant of product.variants) {
            if (sku == variant.sku) {
                if (variant.quantity <= 0) {
                    throw new Error("This product is out of stock")
                }
                productObj.sku = variant.sku
                productObj.qty = 1
                productObj.stock = variant.quantity
            }
        }

        if (!productObj.sku) {
            throw new Error("Product variant not found")
        }

        return await this.cartRepository.saveInDb(userId, productObj)
    }

    async saveItemFromWishListToCart(userId, productId) {
        const wishListId = await this.wishListRepository.getItemById(userId, productId)
        const product = await this.productRepository.getProductById(productId)

        const productObj = {
            productId: product._id,
        }
        let count = 0;
        for (const variant of product.variants) {
            count++
            if (variant.quantity > 0) {
                productObj.sku = variant.sku
                productObj.qty = 1
            }

        }
        const hasStock = product.variants.some(v => v.quantity > 0);

        if (count <= 1 && product.variants[0].quantity == 0 || !hasStock) {
            throw new Error("The item is out of stock");
        }
        if (wishListId) {
            await this.wishListRepository.deleteProductFromDb(productId, userId)
        }

        return await this.cartRepository.saveInDb(userId, productObj)
    }

    async deleteItemFromCart(userId, sku) {
        return await this.cartRepository.deleteItemFromCart(userId, sku)
    }

    async getCartItems(userId) {
        const { cart, count } = await this.cartRepository.getAllItemsByUserId(userId)

        if (!cart) {
            return { cart: { items: [] }, total: 0 }
        }

        let validItems = [];
        let total = 0;
        let removedItemsCount = 0;

        for (let productIdx = 0; productIdx < cart.items.length; productIdx++) {
            const item = cart.items[productIdx];
            const product = item.productId;

            // Check if product or its category is blocked/deleted
            if (!product || !product.isListed || product.isDeleted || (product.category && !product.category.isListed)) {
                await this.cartRepository.deleteItemFromCart(userId, item.sku);
                removedItemsCount++;
                continue;
            }

            let productObj = {}
            let isOutOfStock = true;

            for (const variant of product.variants) {
                if (item.sku == variant.sku) {
                    if (variant.quantity > 0) {
                        productObj.price = variant.price
                        productObj.quantity = variant.quantity
                        productObj.offer = variant.offer
                        productObj.mainImage = variant.mainImage.url
                        productObj.color = variant.color
                        isOutOfStock = false;
                    } else {
                        productObj.stock = 0
                        productObj.price = variant.price
                        productObj.quantity = variant.quantity
                        productObj.offer = variant.offer
                        productObj.mainImage = variant.mainImage.url
                        productObj.color = variant.color
                    }
                    break;
                }
            }

            if (isOutOfStock) {
                const productId = product._id;
                const sku = item.sku;

                const existingWishlistItem = await this.wishListRepository.getItemById(userId, productId);
                if (!existingWishlistItem) {
                    await this.wishListRepository.saveProductInDb(productId, userId, sku);
                }

                await this.cartRepository.deleteItemFromCart(userId, sku);
                removedItemsCount++;

            } else {
                let totalPricePerProduct = 0
                totalPricePerProduct = (productObj.price - ((productObj.price * productObj.offer) / 100)) * item.qty
                total += totalPricePerProduct

                item.info = productObj
                validItems.push(item);
            }
        }

        let finalCart = {
            id: cart._id,
            userId: cart.userId,
            items: validItems
        }

        return { cart: finalCart, total, count: validItems.length, removedItemsCount }
    }

    async incrementQty(sku, userId) {
        const cart = await this.cartRepository.findBySku(userId, sku)
        const cartItem = cart.items.find((item) => {
            return item.sku == sku
        })

        const product = await this.cartRepository.getProductBySku(sku)
        for (const item of product.variants) {
            if (item.sku != sku) continue

            if (item.sku == sku && item.quantity > cartItem.qty) {
                return await this.cartRepository.incrementQty(sku, userId)
            }
            else {
                console.log(`out of stock in service : sku ${item.sku} == ${sku} ${item.quantity} > ${cartItem.qty}`)

                throw new Error("Out of Stock");
            }
        }
        return cart
    }

    async decrementQty(sku, userId) {
        const cart = await this.cartRepository.findBySku(userId, sku)
        if (cart) {
            const item = cart.items.find((item) => {
                return item.sku == sku
            })
            if (item.qty > 1) {
                return await this.cartRepository.decrementQty(sku, userId)
            }
            else {
                throw new Error("Minimum quantity should be one");
            }
        }
    }
}