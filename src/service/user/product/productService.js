import redis from "../../../utils/redis.js";
export default class UserProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async getUserProducts(search, category, brand, page, sort) {

        // redis check
        const cacheKey = `products:${search || ""}:${category || ""}:${brand || ""}:${page || 1}:${sort || ""}`
        
        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            console.log("data from cache")
            return JSON.parse(cachedData)
        }

        const limit = 12;
        const skip = (page - 1) * limit;

        let sortOrder = -1;
        let sortField = "createdAt";

        if (sort === "za") {
            sortOrder = -1;
            sortField = "name";
        } else if (sort === "az") {
            sortOrder = 1;
            sortField = "name";
        } else if (sort === "oldest") {
            sortOrder = 1;
            sortField = "createdAt";
        } else if (sort === "High-Low") {
            sortOrder = -1;
            sortField = "variants.price";
        } else if (sort === "Low-High") {
            sortOrder = 1;
            sortField = "variants.price";
        }

        const { products, totalProducts } =  await this.productRepository.getUserProducts(
            search,
            category,
            brand,
            limit,
            skip,
            sortOrder,
            sortField
        );
        const result = { products, totalProducts }
        try {
            await redis.set(cacheKey,JSON.stringify(result),"EX",300)
        } catch (error) {
            console.log("Counldn't set data in redis", error.message)
        }
        return { products, totalProducts }
    }

    async getAllCategories() {
        return await this.productRepository.getCategories();
    }

    async getAllBrands() {
        return await this.productRepository.getBrands();
    }

    async getProduct(productId){
        const cacheKey = `product:${productId}`
        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
            console.log("data from cache")
            return JSON.parse(cachedData)
        }
        const product = await this.productRepository.getProductById(productId)
        try {
            await redis.set(cacheKey,JSON.stringify(product),"EX",300)
        } catch (error) {
            console.log("Counldn't set data in redis", error.message)
        }
        return product
    }

    async getRelatedProducts(brand, productId){
        return await this.productRepository.getProductByBrand(brand,productId)
    }

    async getHomePageProducts(){
        const limit = 4
        return await this.productRepository.getHomePageProducts(limit)
    }
}
