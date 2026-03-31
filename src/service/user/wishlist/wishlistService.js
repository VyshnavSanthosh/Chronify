export default class WishListService {
    constructor(wishListRepository) {
        this.wishListRepository = wishListRepository
    }

    async saveProduct(productId, userId, sku) {
        const productExist = await this.wishListRepository.getItemById(userId, productId)
        if (productExist) {
            throw new Error("Product already Exits");
        }
        return await this.wishListRepository.saveProductInDb(productId, userId, sku)
    }

    async deleteProduct(productId, userId) {
        return await this.wishListRepository.deleteProductFromDb(productId, userId)
    }

    async getAllItems(userId) {
        const items = await this.wishListRepository.getAllItemsByUserId(userId);
        
        let validItems = [];
        let removedItemsCount = 0;

        for (const item of items) {
            const product = item.productId;

            // Check if product, its category or its vendor is blocked/deleted
            if (!product || !product.isListed || product.isDeleted || (product.category && !product.category.isListed) || (product.vendorId && product.vendorId.isBlocked)) {
                await this.wishListRepository.deleteProductFromDb(item.productId._id, userId);
                removedItemsCount++;
                continue;
            }
            validItems.push(item);
        }

        return { wishlist: validItems, removedItemsCount };
    }
}