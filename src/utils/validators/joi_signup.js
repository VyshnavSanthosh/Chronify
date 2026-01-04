const Joi = require("joi");

module.exports = Joi.object({
    // ---------- First Name ----------
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(30)
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            "string.empty": "First name is required",
            "string.min": "First name must be at least 2 characters",
            "string.max": "First name must be at most 30 characters",
            "string.pattern.base": "First name must contain only letters",
            "any.required": "First name is required"
        }),

    // ---------- Last Name ----------
    lastName: Joi.string()
        .trim()
        .min(1)
        .max(30)
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            "string.empty": "Last name is required",
            "string.max": "Last name must be at most 30 characters",
            "string.pattern.base": "Last name must contain only letters",
            "any.required": "Last name is required"
        }),

    // ---------- Email ----------
    email: Joi.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Invalid email format",
            "string.empty": "Email is required",
            "any.required": "Email is required"
        }),

    // ---------- Phone (India) ----------
    phone: Joi.string()
        .trim()
        .pattern(/^[6-9][0-9]{9}$/)
        .required()
        .messages({
            "string.pattern.base": "Phone number must be a valid 10-digit Indian mobile number",
            "string.empty": "Phone number is required",
            "any.required": "Phone number is required"
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
        }),

    // ---------- Referral Code ----------
    referralCode: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9]{4,10}$/)
        .optional()
        .allow("")
        .messages({
            "string.pattern.base": "Invalid referral code format"
        })
});
