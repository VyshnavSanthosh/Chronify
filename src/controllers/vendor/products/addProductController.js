import fs from "fs";
import { uploadToCloudinary, deleteFolder } from "../../../utils/cloudinary.js";
import mongoose from "mongoose";

export default class AddProductController {
    constructor(productService, joi_product, validator) {
        this.productService = productService
        this.joi_product = joi_product
        this.validator = validator
    }

    async renderAddProductPage(req, res) {
        try {
            const categories = await this.productService.getAllCategories()

            // Get session messages
            const success = req.session.success;
            const error = req.session.error;

            // Clear session messages
            delete req.session.success;
            delete req.session.error;
            return res.status(200).render("vendor/products/addProduct", {
                errors: {},
                formData: {},
                categories,
                success: success || null,
                error: error || null,
                activePage: 'products'
            })
        } catch (error) {
            console.log("error in loading", error)
            return res.status(500).render("vendor/products/addProduct", {
                errors: {},
                formData: {},
                categories: [],
                success: null,
                error: "Failed to load page. Please try again."
            })
        }
    }

    async handleAddProducts(req, res) {


        const { error, value } = this.validator.validate(this.joi_product, req.body)
        const category = req.body.category

        let errors = {}
        if (error) {
            console.log("error", error)

            error.details.forEach(err => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });

            const categories = await this.productService.getAllCategories();

            // remove uploaded files
            for (const file of req.files) {
                fs.unlink((file.path), (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
            }

            return res.status(400).render("vendor/products/addProduct", {
                errors,
                formData: req.body,
                categories,
                success: null,
                error: "Please fix the validation errors and try again.",
                activePage: 'products'
            })
        }

        const { name, brand, description, variants, specifications } = value

        const vendorId = req.user._id

        if (!req.files || req.files.length < 4) {

            const categories = await this.productService.getAllCategories();

            // remove uploaded files
            if (req.files) {
                for (const file of req.files) {
                    fs.unlink((file.path), (err) => {
                        if (err) console.log(err)
                    })
                }
            }

            return res.status(400).render("vendor/products/addProduct", {
                errors: {},
                formData: req.body,
                categories,
                success: null,
                error: "Please upload at least 4 images (1 main image + 3 additional images per variant).",
                activePage: 'products'
            });
        }

        try {
            const folderPath = `chronify/products/vendorId-${vendorId}/products/${name}`

            const mainImages = []
            const additionalImages = []
            const uploadedImageIds = []

            const uploadPromise = req.files.map((file) => {
                console.log(`Starting upload for ${file.fieldname}`)
                return uploadToCloudinary(file.path, folderPath)
            })

            const results = await Promise.allSettled(uploadPromise)

            for (let i = 0; i < results.length; i++) {
                const image = results[i]
                const file = req.files[i]
                if (image.status == "fulfilled") {
                    const cloudinaryResult = image.value
                    uploadedImageIds.push(cloudinaryResult.public_id)

                    const imageObj = {
                        url: cloudinaryResult.secure_url,
                        publicId: cloudinaryResult.public_id,
                        filename: cloudinaryResult.original_filename,
                        fieldname: file.fieldname
                    }
                    if (file.fieldname.includes("mainImage")) {
                        mainImages.push(imageObj)
                    }
                    else if (file.fieldname.includes("additionalImages")) {
                        additionalImages.push(imageObj)
                    }
                }
                else {
                    console.error(`Upload failed for ${file.fieldname}:`, image.reason);
                }
            }

            if (mainImages.length < variants.length) {
                throw new Error("Not all main images were uploaded successfully");
            }

            if (additionalImages.length < (variants.length * 3)) {
                throw new Error("Not all additional images were uploaded successfully");
            }

            let finalVariants = structuredClone(variants);

            for (const image of mainImages) {
                const match = image.fieldname.match(/variants\[(\d+)\]/);
                if (!match) continue;
                const variantNumber = Number(match[1]);
                finalVariants[variantNumber].mainImage = image
            }

            for (const image of additionalImages) {
                const match = image.fieldname.match(/variants\[(\d+)\]/);
                if (!match) continue;
                const variantNumber = Number(match[1]);
                if (!finalVariants[variantNumber].additionalImages) {
                    finalVariants[variantNumber].additionalImages = [];
                }
                finalVariants[variantNumber].additionalImages.push(image)
            }

            const product = {
                name: name.toUpperCase(),
                brand: brand,
                description: description,
                category: category,
                variants: finalVariants,
                specifications: specifications
            }


            try {
                await this.productService.saveProduct(vendorId, product)

                req.session.success = "Product added successfully!";

                return res.status(200).redirect("/vendor/products")
            } catch (error) {
                console.error("Error saving product:", error.message)
                const categories = await this.productService.getAllCategories();

                try {
                    await deleteFolder(folderPath);
                } catch (folderError) {
                    console.error(`Failed to delete folder ${folderPath}:`, folderError.message);
                }

                return res.status(500).render("vendor/products/addProduct", {
                    errors: {},
                    formData: req.body,
                    categories,
                    success: null,
                    error: "Failed to save product. Please try again.",
                    activePage: 'products'
                })
            }
        }
        catch (error) {
            console.log("Unexpected upload error:", error)
            const categories = await this.productService.getAllCategories()

            // remove any uploaded files on error
            if (req.files) {
                for (const file of req.files) {
                    fs.unlink((file.path), (err) => {
                        if (err) console.log(err)
                    })
                }
            }

            return res.status(500).render("vendor/products/addProduct", {
                errors: {},
                formData: req.body,
                categories,
                success: null,
                error: "Unexpected upload error. Please try to upload again",
                activePage: 'products'
            })
        }
    }
}