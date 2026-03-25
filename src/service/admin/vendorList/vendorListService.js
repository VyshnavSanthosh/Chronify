import redis from "../../../utils/redis.js";
import { deleteRedisCache } from "../../../utils/deleteFromRedis.js";

export default class VendorListService {
    constructor(vendorRepository, productRepository) {
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
    }

    async getVendorList(search, page, status, sort) {
        const limit = 10;
        const skip = (page - 1) * limit

        let sortOrder = -1
        let sortField = "createdAt"
        if (sort == "za") {
            sortOrder = -1
            sortField = "brandName"
        }
        else if (sort == "az") {
            sortOrder = 1
            sortField = "brandName"
        }
        const { vendors, totalVendors } = await this.vendorRepository.getAllVendors(limit, skip, sortOrder, search, status, sortField)
        return { vendors, totalVendors }
    }

    async toggleVendorBlockStatus(vendorId, isBlocked) {
        const updatedVendor = await this.vendorRepository.updateVendorBlockStatus(vendorId, isBlocked)

        if (updatedVendor) {
            try {
                // When a vendor's status changes, we must invalidate the product list cache
                await deleteRedisCache("products:*");

                // Also invalidate specific caches for all products of this vendor
                const products = await this.productRepository.getProductIdsByVendor(vendorId);
                if (products && products.length > 0) {
                    const deletePromises = products.map(p => redis.del(`product:${p._id}`));
                    await Promise.all(deletePromises);
                }

                console.log(`✅ Cache invalidated for vendor ${vendorId} products`);
            } catch (error) {
                console.error("❌ Failed to invalidate Redis cache for vendor block:", error.message);
            }
        }

        return updatedVendor
    }
}