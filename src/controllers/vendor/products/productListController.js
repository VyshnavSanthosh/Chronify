import fs from "fs";
import { uploadToCloudinary, deleteFolder } from "../../../utils/cloudinary.js";
import redis from "../../../utils/redis.js";

export default class ProductListController {
    constructor(productService, joi_product, validator) {
        this.productService = productService
        this.joi_product = joi_product
        this.validator = validator
    }

    async renderProductListingPage(req, res) {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const status = req.query.status || "";
        const sort = req.query.sort || "";

        try {
            const vendorId = req.user._id;

            const { products, totalProducts } = await this.productService.getAllProducts(vendorId, search, page, status, sort);

            // Get session messages
            const success = req.session.success;
            const error = req.session.error;

            // Clear session messages
            delete req.session.success;
            delete req.session.error;

            return res.status(200).render("vendor/products/productList", {
                products: products,
                totalProducts: totalProducts,
                currentPage: page,
                search: search,
                status: status,
                sort: sort,
                breadcrumb: 'Dashboard > Products',
                user: req.user,
                success: success || null,
                error: error || null
            })

        } catch (error) {
            console.error("Error rendering product page:", error)
            res.status(500).send("Internal Server Error");
        }
    }

    async toggleProductListing(req, res) {
        try {
            const { productId } = req.params
            const { isListed } = req.body
            const vendorId = req.user._id

            const updatedProduct = await this.productService.toggleProductListing(productId, vendorId, isListed)

            if (updatedProduct) {
                await redis.clearProductCache();
                res.status(200).json({
                    success: true,
                    message: `Product ${isListed ? 'listed' : 'unlisted'} successfully`
                })
            } else {
                res.status(500).json({
                    success: false,
                    message: "Couldn't update product"
                })
            }
        } catch (error) {
            console.error("Error toggling product listing:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while updating the product"
            })
        }
    }

    async deleteProduct(req, res) {
        try {
            const { productId } = req.params
            const vendorId = req.user._id

            await this.productService.deleteProduct(productId, vendorId)

            res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            })
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({
                success: false,
                message: "Failed to delete product"
            })
        }
    }

    async renderEditProductPage(req, res) {
        try {
            const { productId } = req.params
            const product = await this.productService.getProduct(productId)

            if (!product) {
                req.session.error = "Product not found";
                return res.redirect("/vendor/products");
            }

            const categories = await this.productService.getAllCategories();

            // Get session messages
            const success = req.session.success;
            const error = req.session.error;

            // Clear session messages
            delete req.session.success;
            delete req.session.error;
            return res.status(200).render("vendor/products/editAddProduct", {
                isEdit: true,
                productId: productId,
                name: product.name,
                brand: product.brand,
                description: product.description,
                category: product.category,
                categories: categories,
                variants: product.variants,
                specifications: product.specifications,
                errors: {},
                selectedCategory: product.category,
                success: success || null,
                error: error || null,
                activePage: 'products'
            })
        } catch (error) {
            console.error("Error loading edit page:", error);
            req.session.error = "Failed to load product for editing";
            return res.redirect("/vendor/products");
        }
    }

    async handleEditProduct(req, res) {
        const { error, value } = this.validator.validate(this.joi_product, req.body)
        const { productId } = req.params;
        const vendorId = req.user._id;

        if (error) {
            let errors = {};
            error.details.forEach(err => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });

            const categories = await this.productService.getAllCategories();

            // Clean up uploaded files
            if (req.files) {
                for (const file of req.files) {
                    fs.unlink((file.path), (err) => {
                        if (err) console.log(err);
                    });
                }
            }

            return res.status(400).render("vendor/products/editAddProduct", {
                errors,
                isEdit: true,
                productId,
                formData: req.body,
                categories,
                variants: req.body.variants,
                specifications: req.body.specifications,
                name: req.body.name,
                brand: req.body.brand,
                description: req.body.description,
                selectedCategory: req.body.category,
                success: null,
                error: "Please fix the validation errors and try again."
            });
        }

        const { name, brand, description, variants, specifications } = value;

        try {
            const existingProduct = await this.productService.getProduct(productId);

            if (!existingProduct) {
                req.session.error = "Product not found";
                return res.redirect("/vendor/products");
            }

            // Map all existing images: publicId -> imageObject
            const existingImagesMap = new Map();
            existingProduct.variants.forEach(v => {
                if (v.mainImage && v.mainImage.publicId) {
                    existingImagesMap.set(v.mainImage.publicId, v.mainImage);
                }
                if (v.additionalImages) {
                    v.additionalImages.forEach(img => {
                        if (img.publicId) existingImagesMap.set(img.publicId, img);
                    });
                }
            });

            const folderPath = `chronify/products/vendorId-${vendorId}/products/${name}`;
            const uploadedImageIds = [];
            const newImages = []; // Flattened list of new successfully uploaded images

            // Upload new images if any
            if (req.files && req.files.length > 0) {
                const uploadPromise = req.files.map((file) => {
                    console.log(`Starting upload for ${file.fieldname}`);
                    return uploadToCloudinary(file.path, folderPath);
                });

                const results = await Promise.allSettled(uploadPromise);

                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    const file = req.files[i];

                    if (result.status === "fulfilled") {
                        const cloudinaryResult = result.value;
                        const imageObj = {
                            url: cloudinaryResult.secure_url,
                            publicId: cloudinaryResult.public_id,
                            filename: cloudinaryResult.original_filename,
                            fieldname: file.fieldname
                        };
                        newImages.push(imageObj);
                        uploadedImageIds.push(cloudinaryResult.public_id);
                    } else {
                        console.error(`Upload failed for ${file.fieldname}:`, result.reason);
                    }
                }
            }

            let finalVariants = structuredClone(variants);

            // Process each variant's images
            for (let i = 0; i < finalVariants.length; i++) {
                const variant = finalVariants[i];

                // Handle main image
                const newMainImage = newImages.find(img => img.fieldname === `variants[${i}][mainImage]`);
                if (newMainImage) {
                    variant.mainImage = {
                        url: newMainImage.url,
                        publicId: newMainImage.publicId,
                        filename: newMainImage.filename
                    };
                } else if (variant.existingMainImage) {
                    const preservedImg = existingImagesMap.get(variant.existingMainImage);
                    if (preservedImg) {
                        variant.mainImage = preservedImg;
                    } else {
                        throw new Error(`Existing main image not found for variant ${i + 1}`);
                    }
                } else {
                    throw new Error(`No main image provided for variant ${i + 1}`);
                }

                // Handle additional images
                variant.additionalImages = [];
                for (let j = 0; j < 3; j++) {
                    const newAddImg = newImages.find(img => img.fieldname === `variants[${i}][additionalImages][${j}]`);

                    if (newAddImg) {
                        variant.additionalImages.push({
                            url: newAddImg.url,
                            publicId: newAddImg.publicId,
                            filename: newAddImg.filename
                        });
                    } else if (variant.existingAdditionalImages && variant.existingAdditionalImages[j]) {
                        const preservedId = variant.existingAdditionalImages[j];
                        if (preservedId) {
                            const preservedImg = existingImagesMap.get(preservedId);
                            if (preservedImg) {
                                variant.additionalImages.push(preservedImg);
                            } else {
                                throw new Error(`Existing additional image not found for variant ${i + 1} image ${j + 1}`);
                            }
                        }
                    } else {
                        throw new Error(`Missing additional image ${j + 1} for variant ${i + 1}`);
                    }
                }
            }

            const productData = {
                name,
                brand,
                category: value.category,
                description,
                variants: finalVariants,
                specifications
            };

            await this.productService.updateProduct(productId, vendorId, productData);

            // Set success message in session
            req.session.success = "Product updated successfully!";

            return res.redirect("/vendor/products");

        } catch (error) {
            console.error("Error updating product:", error.message);

            // Clean up uploaded files on error
            if (req.files) {
                for (const file of req.files) {
                    fs.unlink((file.path), (err) => {
                        if (err) console.log(err)
                    })
                }
            }

            const categories = await this.productService.getAllCategories();

            return res.status(500).render("vendor/products/editAddProduct", {
                errors: {},
                isEdit: true,
                productId,
                formData: req.body,
                categories,
                variants: req.body.variants,
                specifications: req.body.specifications,
                name: req.body.name,
                brand: req.body.brand,
                description: req.body.description,
                selectedCategory: req.body.category,
                success: null,
                error: "Failed to update product. " + error.message,
                
            });
        }
    }
}