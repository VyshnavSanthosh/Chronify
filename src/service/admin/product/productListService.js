export default class ProductListService {
    constructor(productRepository) {
        this.productRepository = productRepository
    }

    async getAllProducts(search, category, brand, page, sort) {
        const limit = 10;
        const skip = (page - 1) * limit
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
        else if (sort == 'High-Low') {
            sortOrder = -1
            sortField = "variants.price"
        }
        else if (sort == 'Low-High') {
            sortOrder = 1
            sortField = "variants.price"
        }
        const products = await this.productRepository.getAllProduts(search, category, brand, limit, skip, sortOrder, sortField)
        return products

    }
    async getAllCategories() {
        return await this.productRepository.getCategories();
    }

    async getAllBrands() {
        return await this.productRepository.getBrands();
    }

    async getAllPendingProducts(page) {
        const limit = 10
        const skip = (page - 1) * limit
        const { products, totalProducts } = await this.productRepository.getAllPendingProducts(limit, skip)
        return { products, totalProducts }
    }

    async approve(productId) {
        const updatedProduct = await this.productRepository.approve(productId)
        console.log("updated", updatedProduct)
        return updatedProduct
    }

    async reject(productId) {
        const updatedProduct = await this.productRepository.reject(productId)
        console.log("updated", updatedProduct)
        return updatedProduct
    }
}