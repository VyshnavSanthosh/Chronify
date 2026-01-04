const Joi = require("joi");

module.exports = Joi.object({
    // ---------- Brand Name ----------
    brandName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z0-9 &.-]+$/)
        .required()
        .messages({
            "string.empty": "Brand name is required",
            "string.min": "Brand name must be at least 2 characters",
            "string.max": "Brand name must be at most 50 characters",
            "string.pattern.base": "Brand name contains invalid characters",
            "any.required": "Brand name is required"
        }),

    // ---------- Brand Email ----------
    brandEmail: Joi.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
            "any.required": "Email is required"
        }),

    // ---------- Mobile Number (India) ----------
    mobileNumber: Joi.string()
        .trim()
        .pattern(/^[6-9][0-9]{9}$/)
        .required()
        .messages({
            "string.pattern.base": "Mobile number must be a valid 10-digit Indian number",
            "string.empty": "Mobile number is required",
            "any.required": "Mobile number is required"
        }),

    // ---------- Password ----------
    password: Joi.string()
        .min(8)
        .max(64)
        .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password must be at most 64 characters",
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            "string.empty": "Password is required",
            "any.required": "Password is required"
        }),

    // ---------- Confirm Password ----------
    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "string.empty": "Confirm password is required",
            "any.required": "Confirm password is required"
        })
});
