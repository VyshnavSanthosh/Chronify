import { deleteRedisCache } from "../../../utils/deleteFromRedis.js";
export default class InventoryService {
    constructor(productInventoryRepository) {
        this.productInventoryRepository = productInventoryRepository
    }
    async reserveStock(products) {
        const productDetailPattern = `product:*`
        try {
            await deleteRedisCache(productDetailPattern)
            console.log("cache deleted")
        } catch (error) {
            console.log("couldnt delete from cache", error)
        }
        return await this.productInventoryRepository.reserveStock(products)
        setTimeout(() => {
            
        }, 600000);
    }

    async releaseStock(products) {
        const productDetailPattern = `product:*`
        try {
            await deleteRedisCache(productDetailPattern)
            console.log("cache deleted")
            
        } catch (error) {
            console.log("couldnt    delete from cache", error)
        }
        return await this.productInventoryRepository.releaseStock(products)
    }

    async deductStock(products) {
        const productDetailPattern = `product:*`
        try {
            await deleteRedisCache(productDetailPattern)
            console.log("cache deleted")
        } catch (error) {
            console.log("couldnt delete from cache", error)
        }
        return await this.productInventoryRepository.deductStock(products)
    }
}



