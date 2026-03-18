import Product from '../../models/vendor/productSchema.js';
import Category from "../../models/admin/categorySchema.js";

export default class ProductRepository {

    async findByProductName(productName) {
        return await Product.findOne({ name: productName })
    }

    async findAllProductsByVendor(vendorId, limit, skip, sortOrder, search, status, sortField) {
        const query = {
            vendorId: vendorId,
            isDeleted: false
        }
        if (status && status !== 'All') {
            query.status = status;
        }
        if (search) {
            query.name = { $regex: search, $options: "i" }
        }
        const sortObj = {}
        sortObj[sortField] = sortOrder

        const products = await Product.find(query)
            .populate('category')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query)

        return { products, totalProducts }
    }

    async getAllProduts(search, category, brand, limit, skip, sortOrder, sortField) {
        try {
            const query = {
                isListed: true,
                isDeleted: false,
                status: "approved"
            }

            if (search) {
                query.name = { $regex: search, $options: "i" }
            }

            const listedCategories = await Category.find({ isListed: true }).select("_id");
            const listedCategoryIds = listedCategories.map(cat => cat._id);

            if (category && category !== "All") {
                const categoryDoc = await Category.findOne({
                    categoryName: category,
                    isListed: true
                }).select("_id");

                if (!categoryDoc) {
                    return { products: [], totalProducts: 0 };
                }

                query.category = categoryDoc._id;
            } else {
                query.category = { $in: listedCategoryIds };
            }

            if (brand && brand !== "All") {
                query.brand = brand
            }
            const sortObj = {}
            sortObj[sortField] = sortOrder

            const products = await Product.find(query)
                .populate("category")
                .populate("vendorId", "brandName")
                .sort(sortObj)
                .skip(skip)
                .limit(limit)

            const totalProducts = await Product.countDocuments(query)


            return { products, totalProducts }
        } catch (error) {
            console.log("Couldn't get any products", error.message)

        }
    }

    async getAllPendingProducts(limit, skip) {
        try {
            const query = {
                isListed: true,
                isDeleted: false,
                status: "pending"
            }
            const products = await Product.find(query)
                .populate("category")
                .populate("vendorId", "brandName")
                .skip(skip)
                .limit(limit)
            const totalProducts = await Product.countDocuments(query)


            return { products, totalProducts }
        } catch (error) {
            console.log("Couldn't get any pending products", error)

        }

    }

    async createProduct(productData) {
        try {
            const product = new Product(productData);
            return await product.save();
        } catch (error) {
            throw new Error(`Failed to create product db error: ${error.message}`);
        }
    }

    async updateIsListed(productId, isListed) {
        try {

            const product = await Product.findByIdAndUpdate(
                productId,
                { isListed: isListed },
                { new: true }
            )
            return product
        } catch (error) {
            console.error("Error updating product listing status:", error.message);
        }
    }

    async deleteProductById(productId) {
        try {
            await Product.findByIdAndUpdate(productId,
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            console.log("error deleting product from db", error.message)
        }
    }

    async findProductById(productId) {
        try {
            const product = await Product.findById(productId)
            return product
        } catch (error) {
            console.log("Failed to get product from db")

        }
    }
    async updateProductById(productId, updateData) {
        try {
            const product = await Product.findByIdAndUpdate(
                productId,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return product;
        } catch (error) {
            console.error("Error updating product in db:", error.message);
            throw error;
        }
    }
    async getCategories() {
        try {
            return await Category.find({ isListed: true }).select('_id categoryName');
        } catch (error) {
            console.log("Couldn't get categories", error);
            return [];
        }
    }

    async getBrands() {
        try {
            return await Product.distinct('brand', {
                isDeleted: false,
                status: 'approved'
            });
        } catch (error) {
            console.log("Couldn't get brands", error);
            return [];
        }
    }

    async approve(productId) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(productId,
                { status: "approved" },
                { new: true }
            )
            return updatedProduct
        } catch (error) {
            console.log("couldnt approve the product", error)

        }

    }

    async reject(productId) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(productId,
                { status: "rejected" },
                { new: true }
            )
            return updatedProduct
        } catch (error) {
            console.log("couldnt reject the product", error)
        }
    }

    async getUserProducts(search, category, brand, limit, skip, sortOrder, sortField) {
        try {
            const query = {
                isListed: true,
                isDeleted: false,
                status: "approved"
            };

            if (search) {
                query.name = { $regex: search, $options: "i" };
            }

            const listedCategories = await Category.find({ isListed: true }).select("_id");
            const listedCategoryIds = listedCategories.map(cat => cat._id);

            if (category && category !== "All") {
                const categoryDoc = await Category.findOne({
                    categoryName: category,
                    isListed: true
                }).select("_id");

                if (!categoryDoc) {
                    return { products: [], totalProducts: 0 };
                }

                query.category = categoryDoc._id;
            } else {
                query.category = { $in: listedCategoryIds };
            }

            if (brand && brand !== "All") {
                query.brand = brand;
            }

            const sortObj = {};
            sortObj[sortField] = sortOrder;

            const products = await Product.find(query)
                .populate({
                    path: "category",
                    match: { isListed: true }
                })
                .populate("vendorId", "brandName")
                .sort(sortObj)
                .skip(skip)
                .limit(limit);

            const totalProducts = await Product.countDocuments(query);

            return { products, totalProducts };
        } catch (error) {
            console.log("Couldn't get user products", error);
            return { products: [], totalProducts: 0 };
        }
    }

    async getProductById(productId) {
        try {
            const product = await Product.findById(productId).populate('category');
            return product
        } catch (error) {
            console.log("Couldn't get the product")
        }
    }

    async getProductByBrand(brand, productId) {
        try {
            const listedCategories = await Category.find({ isListed: true }).select("_id");
            const listedCategoryIds = listedCategories.map(cat => cat._id);

            const product = await Product.find({
                brand: brand,
                _id: { $ne: productId },
                isListed: true,
                isDeleted: false,
                status: "approved",
                category: { $in: listedCategoryIds }
            }).limit(3)
            return product
        } catch (error) {
            console.log("Couldn't get related products")
        }
    }

    async getHomePageProducts(limit) {
        try {
            const listedCategories = await Category.find({ isListed: true }).select("_id");
            const listedCategoryIds = listedCategories.map(cat => cat._id);

            return await Product.find({
                isListed: true,
                isDeleted: false,
                status: "approved",
                category: { $in: listedCategoryIds }
            }).limit(limit)
        } catch (error) {
            console.log("Couldn't get home page product")
        }
    }

    async getProductIdsByVendor(vendorId) {
        try {
            const products = await Product.find({ vendorId: vendorId }).select('_id');
            return products;
        } catch (error) {
            console.log("Error getting vendor product IDs:", error);
            throw error;
        }
    }

}
