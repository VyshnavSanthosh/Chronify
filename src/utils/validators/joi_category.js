const Joi = require("joi");

module.exports = Joi.object({
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
        .valid("percentage", "flat")
        .required()
        .messages({
            "string.empty": "Discount type is required",
            "any.only": "Discount type must be either 'percentage' or 'flat'",
            "any.required": "Discount type is required"
        }),

    // ---------- Discount Value ----------
    discountValue: Joi.number()
        .positive()
        .precision(2)
        .max(100000)
        .required()
        .messages({
            "number.base": "Discount value must be a valid number",
            "number.positive": "Discount value must be greater than 0",
            "number.max": "Discount value cannot exceed 100000",
            "any.required": "Discount value is required"
        }),

    // ---------- Max Redeemable Amount ----------
    maxRedeemable: Joi.alternatives()
        .try(
            Joi.number()
                .positive()
                .precision(2)
                .max(999999.99),
            Joi.string()
                .trim()
                .empty("")
                .allow(null)
        )
        .optional()
        .default(null)
        .messages({
            "number.base": "Max redeemable amount must be a valid number",
            "number.positive": "Max redeemable amount must be greater than 0",
            "number.max": "Max redeemable amount cannot exceed 999999.99"
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