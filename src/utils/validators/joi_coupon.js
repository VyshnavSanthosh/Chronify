import Joi from "joi";

export default Joi.object({

    // ---------- Coupon Code ----------
    couponCode: Joi.string()
        .trim()
        .uppercase()
        .min(3)
        .max(20)
        .pattern(/^[A-Z0-9_-]+$/)
        .required()
        .messages({
            "string.empty": "Coupon code is required",
            "string.min": "Coupon code must be at least 3 characters",
            "string.max": "Coupon code must be at most 20 characters",
            "string.pattern.base": "Coupon code can contain only uppercase letters, numbers, _ and -",
            "any.required": "Coupon code is required"
        }),

    // ---------- Discount % ----------
    discount: Joi.number()
        .min(1)
        .max(90)
        .required()
        .messages({
            "number.base": "Discount must be a number",
            "number.min": "Discount must be at least 1%",
            "number.max": "Discount cannot exceed 90%",
            "any.required": "Discount is required"
        }),

    // ---------- Description ----------
    description: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .required()
        .messages({
            "string.empty": "Description is required",
            "string.min": "Description must be at least 5 characters",
            "string.max": "Description must be at most 200 characters",
            "any.required": "Description is required"
        }),

    // ---------- Usage Limit ----------
    usageLimit: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            "number.base": "Usage limit must be a number",
            "number.integer": "Usage limit must be a whole number",
            "number.min": "Usage limit must be at least 1",
            "any.required": "Usage limit is required"
        }),

    // ---------- Starting Date ----------
    startDate: Joi.date()
        .required()
        .messages({
            "date.base": "Starting date must be a valid date",
            "any.required": "Starting date is required"
        }),

    // ---------- Expiry Date ----------
    expiryDate: Joi.date()
        .greater(Joi.ref("startDate"))
        .required()
        .messages({
            "date.base": "Expiry date must be a valid date",
            "date.greater": "Expiry date must be greater than starting date",
            "any.required": "Expiry date is required"
        }),

    // ---------- Apply Type ----------
    applyType: Joi.string()
        .trim()
        .lowercase()
        .valid("all")
        .default("all"),

    // ---------- Max Discount Amount ----------
    maxDiscountAmount: Joi.number()
        .min(1)
        .required()
        .messages({
            "number.base": "Max discount amount must be a number",
            "number.min": "Max discount amount must be at least 1",
            "any.required": "Max discount amount is required"
        }),

    // ---------- Minimum Purchase ----------
    minimumPurchase: Joi.number()
        .min(0)
        .required()
        .messages({
            "number.base": "Minimum purchase must be a number",
            "number.min": "Minimum purchase cannot be negative",
            "any.required": "Minimum purchase is required"
        }),

    // ---------- Category ----------
    category: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional()
        .allow("")
        .messages({
            "string.min": "Category must be at least 2 characters",
            "string.max": "Category must be at most 50 characters"
        })

});
