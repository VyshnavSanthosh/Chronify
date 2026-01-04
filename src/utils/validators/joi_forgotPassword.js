const Joi = require("joi");

module.exports = Joi.object({
    email: Joi.string().trim().email().required().messages({
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
        "any.required": "Email is required"
    })
});