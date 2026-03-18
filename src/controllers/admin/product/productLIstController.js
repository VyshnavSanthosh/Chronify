export default class ProductListController {
    constructor(productListService) {
        this.productListService = productListService
    }

    async renderProductListPage(req, res) {
        try {

            const search = req.query.search || "";
            const category = req.query.category || "";
            const brand = req.query.brand || "";
            const page = Number(req.query.page) || 1;
            const sort = req.query.sort || "";
            const { products, totalProducts } = await this.productListService.getAllProducts(search, category, brand, page, sort)

            let sum = 0
            for (const product of products) {
                for (const variant of product.variants) {
                    sum += variant.price
                }
            }
            console.log(sum)
            const categories = await this.productListService.getAllCategories();

            const brands = await this.productListService.getAllBrands();

            return res.status(200).render("admin/products/productList", {
                products: products,
                totalProducts: totalProducts,
                categories: categories,
                brands: brands,
                page: page,
                search: search,
                category: category,
                brand: brand,
                sort: sort,
                userName: req.vendor ? req.vendor.name : 'Vyshnav',
                userRole: req.vendor ? req.vendor.role : 'Admin'
            })
        } catch (error) {
            console.log("Couldn't render product list page", error)
        }
    }

    async renderProductPendingListPage(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const { products, totalProducts } = await this.productListService.getAllPendingProducts(page)
            return res.status(200).render("admin/products/productPendingList", {
                products: products,
                totalProducts: totalProducts,
                page: page,
                userName: req.vendor ? req.vendor.name : 'Vyshnav',
                userRole: req.vendor ? req.vendor.role : 'Admin'
            })
        } catch (error) {
            console.log("Couldn't render product-peding list page", error)
        }
    }

    async approveProduct(req, res) {
        try {
            console.log('Approve product called with ID:', req.params.productId);
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required"
                });
            }

            const updatedProduct = await this.productListService.approve(productId);

            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            console.log('Product approved successfully:', updatedProduct._id);

            return res.status(200).json({
                success: true,
                message: "Product approved successfully",
                product: updatedProduct
            });
        } catch (error) {
            console.error("Couldn't approve product", error);
            return res.status(500).json({
                success: false,
                message: "Failed to approve product"
            });
        }
    }

    async rejectProduct(req, res) {
        try {
            console.log('Reject product called with ID:', req.params.productId);
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required"
                });
            }

            const updatedProduct = await this.productListService.reject(productId);

            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            console.log('Product rejected successfully:', updatedProduct._id);

            return res.status(200).json({
                success: true,
                message: "Product rejected successfully",
                product: updatedProduct
            });
        } catch (error) {
            console.error("Couldn't reject product", error);
            return res.status(500).json({
                success: false,
                message: "Failed to reject product"
            });
        }
    }
}