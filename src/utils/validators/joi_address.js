import Joi from "joi";

export default Joi.object({
    // ---------- Address ----------
    address: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .required()
        .messages({
            "string.empty": "Address is required",
            "string.min": "Address must be at least 5 characters",
            "string.max": "Address must be at most 200 characters",
            "any.required": "Address is required"
        }),

    // ---------- Name ----------
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name must be at most 50 characters",
            "string.pattern.base": "Name must contain only letters and spaces",
            "any.required": "Name is required"
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

    // ---------- District / Town ----------
    district: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
            "string.empty": "District is required",
            "string.min": "District must be at least 2 characters",
            "string.max": "District must be at most 50 characters",
            "string.pattern.base": "District must contain only letters and spaces",
            "any.required": "District is required"
        }),

    // ---------- State ----------
    state: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
            "string.empty": "State is required",
            "string.min": "State must be at least 2 characters",
            "string.max": "State must be at most 50 characters",
            "string.pattern.base": "State must contain only letters and spaces",
            "any.required": "State is required"
        }),

    // ---------- Landmark ----------
    landmark: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .allow("")
        .messages({
            "string.min": "Landmark must be at least 2 characters",
            "string.max": "Landmark must be at most 100 characters"
        }),

    // ---------- Pin Code (India) ----------
    pinCode: Joi.string()
        .trim()
        .pattern(/^[1-9][0-9]{5}$/)
        .required()
        .messages({
            "string.pattern.base": "Pin code must be a valid 6-digit Indian postal code",
            "string.empty": "Pin code is required",
            "any.required": "Pin code is required"
        }),

    // ---------- Address Type ----------
    addressType: Joi.string()
        .trim()
        .lowercase()
        .valid("home", "work")
        .required()
        .messages({
            "any.only": "Address type must be either 'home' or 'work'",
            "string.empty": "Address type is required",
            "any.required": "Address type is required"
        }),

    // ---------- Make Default ----------
    makeDefault: Joi.boolean()
        .optional()
        .default(false)
        .messages({
            "boolean.base": "Make default must be a boolean value"
        })
});