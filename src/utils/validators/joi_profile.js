import Joi from "joi";
export default Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            "string.empty": "First name is required",
            "string.min": "First name must be at least 2 characters",
            "string.max": "First name must be at most 30 characters",
            "string.pattern.base": "First name must contain only letters",
            "any.required": "First name is required"
        }),

    lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .pattern(/^[A-Za-z]+$/)
        .required()
        .messages({
            "string.empty": "First name is required",
            "string.min": "First name must be at least 1 characters",
            "string.max": "First name must be at most 30 characters",
            "string.pattern.base": "First name must contain only letters",
            "any.required": "First name is required"
        }),

    phone: Joi.string()
        .trim()
        .pattern(/^[6-9][0-9]{9}$/)
        .required()
        .messages({
            "string.pattern.base": "Phone number must be a valid 10-digit Indian mobile number",
            "string.empty": "Phone number is required",
            "any.required": "Phone number is required"
        }),
});