import Joi from "joi";

export default Joi.object({
    // ---------- Category Name ----------
    categoryName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-Z\s\-]+$/)
        .required()
        .messages({
            "string.empty": "Category name is required",
            "string.min": "Category name must be at least 2 characters",
            "string.max": "Category name must be at most 100 characters",
            "string.pattern.base": "Category name can only contain letters, spaces, and hyphens",
            "any.required": "Category name is required"
        }),

    // ---------- Description ----------
    description: Joi.string()
        .trim()
        .min(10)
        .max(1000)
        .pattern(/^[a-zA-Z\s\-,]+$/)
        .required()
        .messages({
            "string.empty": "Description is required",
            "string.min": "Description must be at least 10 characters",
            "string.max": "Description must be at most 1000 characters",
            "string.pattern.base": "Description can only contain letters, spaces, hyphens, and commas",
            "any.required": "Description is required"
        }),

    // ---------- Discount Type ----------
    discountType: Joi.string()
        .trim()
        .lowercase()
        .valid("percentage")
        .required()
        .messages({
            "string.empty": "Discount type is required",
            "any.only": "Discount type must be 'percentage'",
            "any.required": "Discount type is required"
        }),

    // ---------- Discount Value ----------
    discountValue: Joi.number()
        .precision(2)
        .max(100000)
        .required()
        .messages({
            "number.base": "Discount value must be a valid number",
            "number.max": "Discount value cannot exceed 100000",
            "any.required": "Discount value is required"
        }),


    // ---------- Is Listed ----------
    isListed: Joi.boolean()
        .optional()
        .default(true)
        .messages({
            "boolean.base": "Is listed must be a boolean value"
        })
})
    .unknown(false)
    .options({ abortEarly: false, stripUnknown: true });