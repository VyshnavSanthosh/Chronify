import Joi from "joi";

export default Joi.object({
    // ---------- Product Name ----------
    name: Joi.string()
        .trim()
        .min(3)
        .max(200)
        .pattern(/^[a-zA-Z0-9\s\-()]+$/)
        .required()
        .messages({
            "string.empty": "Product name is required",
            "string.min": "Product name must be at least 2 characters",
            "string.max": "Product name must be at most 200 characters",
            "string.pattern.base": "Product name can only contain letters, numbers, spaces, hyphens, and brackets",
            "any.required": "Product name is required"
        }),


    // ---------- Brand Name ----------
    brand: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .pattern(/^[a-zA-Z\s\-,]+$/)
        .required()
        .messages({
            "string.empty": "Brand name is required",
            "string.min": "Brand name must be at least 1 character",
            "string.max": "Brand name must be at most 100 characters",
            "string.pattern.base": "Category name can only contain letters, spaces, and hyphens",
            "any.required": "Brand name is required"
        }),

    // ---------- Description ----------
    description: Joi.string()
        .trim()
        .min(10)
        .max(5000)
        .required()
        .messages({
            "string.empty": "Description is required",
            "string.min": "Description must be at least 10 characters",
            "string.max": "Description must be at most 5000 characters",
            "any.required": "Description is required"
        }),



    // ---------- Variants ----------
    variants: Joi.array()
        .min(1)
        .items(
            Joi.object({
                color: Joi.string()
                    .trim()
                    .min(2)
                    .max(50)
                    .pattern(/^[a-zA-Z\s,]+$/)
                    .required()
                    .messages({
                        "string.empty": "Color is required",
                        "string.min": "Color must be at least 2 characters",
                        "string.max": "Color must be at most 50 characters",
                        "string.pattern.base": "Category name can only contain letters, spaces",
                        "any.required": "Color is required"
                    }),

                strapMaterial: Joi.string()
                    .trim()
                    .min(2)
                    .max(50)
                    .pattern(/^[a-zA-Z\s,]+$/)
                    .required()
                    .messages({
                        "string.empty": "Strap material is required",
                        "string.min": "Strap material must be at least 2 characters",
                        "string.max": "Strap material must be at most 50 characters",
                        "string.pattern.base": "Category name can only contain letters, spaces",
                        "any.required": "Strap material is required"
                    }),

                price: Joi.number()
                    .positive()
                    .precision(2)
                    .max(9999999.99)
                    .required()
                    .messages({
                        "number.base": "Price must be a valid number",
                        "number.positive": "Price must be greater than 0",
                        "number.max": "Price cannot exceed 9999999.99",
                        "any.required": "Price is required"
                    }),

                quantity: Joi.number()
                    .integer()
                    .min(0)
                    .max(999999)
                    .required()
                    .messages({
                        "number.base": "Stock quantity must be a valid number",
                        "number.integer": "Stock quantity must be a whole number",
                        "number.min": "Stock quantity cannot be negative",
                        "number.max": "Stock quantity cannot exceed 999999",
                        "any.required": "Stock quantity is required"
                    }),

                offer: Joi.number()
                    .integer()
                    .min(0)
                    .max(100)
                    .optional()
                    .default(0)
                    .messages({
                        "number.base": "Offer must be a valid number",
                        "number.integer": "Offer must be a whole number",
                        "number.min": "Offer cannot be negative",
                        "number.max": "Offer cannot exceed 100"
                    }),

                existingMainImage: Joi.any().optional(),
                existingAdditionalImages: Joi.any().optional()
            })
        )
        .required()
        .messages({
            "array.min": "At least one variant is required",
            "any.required": "Product variants are required"
        }),

    // ---------- Specifications ----------
    specifications: Joi.object({
        weight: Joi.string()
            .trim()
            .min(1)
            .max(50)
            .required()
            .messages({
                "string.empty": "Weight is required",
                "string.min": "Weight must be at least 1 character",
                "string.max": "Weight must be at most 50 characters",
                "any.required": "Weight is required"
            }),



        waterResistance: Joi.string()
            .trim()
            .min(1)
            .max(50)
            .required()
            .messages({
                "string.empty": "Water resistance is required",
                "string.min": "Water resistance must be at least 1 character",
                "string.max": "Water resistance must be at most 50 characters",
                "any.required": "Water resistance is required"
            }),

        warranty: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .required()
            .messages({
                "string.empty": "Warranty is required",
                "string.min": "Warranty must be at least 1 character",
                "string.max": "Warranty must be at most 100 characters",
                "any.required": "Warranty is required"
            })
    })
        .required()
        .messages({
            "any.required": "Product specifications are required"
        })
})
    .unknown(true)
    .options({ abortEarly: false, convert: true });


