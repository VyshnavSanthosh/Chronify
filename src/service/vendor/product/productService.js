import { deleteFromCloudinary } from "../../../utils/cloudinary.js";
import redis from "../../../utils/redis.js";
import { deleteRedisCache } from "../../../utils/deleteFromRedis.js";
export default class AddProductService {
    constructor(categoryRepository, productRepository) {
        this.categoryRepository = categoryRepository
        this.productRepository = productRepository
    }

    async getAllCategories() {
        const categories = await this.categoryRepository.getAllCategoriesForProductPage()

        return categories
    }

    async getAllProducts(vendorId, search, page, status, sort) {
        const cacheKey = `products:${vendorId}:${search || ''}:${page || 1}:${status || ''}:${sort || ''}`;
        try {
            const cachedData = await redis.get(cacheKey)
            if (cachedData) {
                return JSON.parse(cachedData)
            }
        } catch (error) {
            console.log("Couldn't get data from redis", error.message)
        }
        const limit = 10
        const skip = (page - 1) * limit;
        let sortOrder = -1
        let sortField = "createdAt"
        if (sort == "za") {
            sortOrder = -1
            sortField = "name"
        }
        else if (sort == "az") {
            sortOrder = 1
            sortField = "name"
        }
        else if (sort == 'oldest') {
            sortOrder = 1
        }

        const { products, totalProducts } = await this.productRepository.findAllProductsByVendor(vendorId, limit, skip, sortOrder, search, status, sortField);
        const result = { products, totalProducts }
        try {
            await redis.set(cacheKey, JSON.stringify(result), "EX", 300)// 5 min expiry
        } catch (error) {
            console.log("Counldn't set data in redis", error.message)
        }
        return { products, totalProducts }

    }

    async saveProduct(vendorId, product) {
        try {
            const existingProduct = await this.productRepository.findByProductName(product.name)

            if (existingProduct) {
                throw new Error("Product with this name exists");
            }
            const productData = {
                name: product.name,
                brand: product.brand,
                category: product.category,
                description: product.description,
                vendorId: vendorId,
                variants: product.variants.map((variant) => ({
                    sku: `Chronify-${product.name}-${variant.color}-${variant.strapMaterial}`.toUpperCase(),
                    color: variant.color,
                    strapMaterial: variant.strapMaterial,
                    price: Number(variant.price),
                    quantity: Number(variant.quantity),
                    offer: Number(variant.offer) || 0,
                    mainImage: {
                        url: variant.mainImage.url,
                        publicId: variant.mainImage.publicId,
                        filename: variant.mainImage.filename
                    },
                    additionalImages: variant.additionalImages.map(img => ({
                        url: img.url,
                        publicId: img.publicId,
                        filename: img.filename
                    }))
                })),
                specifications: {
                    weight: product.specifications.weight,
                    waterResistance: product.specifications.waterResistance,
                    warranty: product.specifications.warranty
                }
            }
            
            const savedProduct = await this.productRepository.createProduct(productData);

            
            const pattern = `products:${vendorId}:*`
            await deleteRedisCache(pattern)
            return savedProduct;
        } catch (error) {
            console.error('Error saving product in db:', error);
            throw error;
        }

    }

    async toggleProductListing(productId, vendorId, isListed){
        try {
            const updatedProduct = await this.productRepository.updateIsListed(productId, isListed)

            const pattern = `products:${vendorId}:*`
            const productDetailPattern = `product:*`
            try {
                await deleteRedisCache(pattern)
                await deleteRedisCache(productDetailPattern)
            } catch (error) {
                console.log("couldnt delete from cache", error)
            }
            return updatedProduct
        } catch (error) {
            console.log("Couldn't update is listed")
        }
    }

    async deleteProduct(productId, vendorId) {
        try {
            await this.productRepository.deleteProductById(productId)

            const pattern = `products:${vendorId}:*`
            const productDetailPattern = `product:*`
            try {
                await deleteRedisCache(pattern)
                await deleteRedisCache(productDetailPattern)
            } catch (error) {
                console.log("couldnt delete from cache", error)
            }
        } catch (error) {
            console.log("couldnt delete product", error.message)
        }
    }

    async getProduct(productId) {
        try {
            const product = await this.productRepository.findProductById(productId)
            return product
        }
        catch (error) {
            console.log("couldnt get the product")

        }
    }
    async updateProduct(productId, vendorId, productData) {
        try {
            // Check if name is taken by ANOTHER product
            const existingProduct = await this.productRepository.findByProductName(productData.name);
            if (existingProduct && existingProduct._id.toString() !== productId) {
                throw new Error("Product with this name already exists");
            }

            const formattedData = {
                name: productData.name,
                brand: productData.brand,
                category: productData.category,
                description: productData.description,
                variants: productData.variants.map((variant) => ({
                    sku: `Chronify-${productData.name}-${variant.color}-${variant.strapMaterial}`.toUpperCase(),
                    color: variant.color,
                    strapMaterial: variant.strapMaterial,
                    price: Number(variant.price),
                    quantity: Number(variant.quantity),
                    offer: Number(variant.offer) || 0,
                    mainImage: {
                        url: variant.mainImage.url,
                        publicId: variant.mainImage.publicId,
                        filename: variant.mainImage.filename
                    },
                    additionalImages: variant.additionalImages.map(img => ({
                        url: img.url,
                        publicId: img.publicId,
                        filename: img.filename
                    }))
                })),
                specifications: {
                    weight: productData.specifications.weight,
                    waterResistance: productData.specifications.waterResistance,
                    warranty: productData.specifications.warranty
                }
            };

            const updatedProduct = await this.productRepository.updateProductById(productId, formattedData);

            const pattern = `products:${vendorId}:*`
            const productDetailPattern = `product:*`
            try {
                await deleteRedisCache(pattern)
                await deleteRedisCache(productDetailPattern)
                console.log("cache deleted")
            } catch (error) {
                console.log("couldnt delete from cache", error)
            }

            return updatedProduct;
        } catch (error) {
            console.error("Error updating product in service:", error.message);
            throw error;
        }
    }
}