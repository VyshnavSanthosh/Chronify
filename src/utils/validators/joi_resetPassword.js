const Joi = require("joi");

module.exports = Joi.object({
    newPassword: Joi.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters",
        "string.empty": "New password is required",
        "any.required": "New password is required"
    }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Confirm password is required",
            "string.empty": "Confirm password is required"
        })
});