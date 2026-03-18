import Joi from "joi";

export default Joi.object({
    email: Joi.string().trim().email().required().messages({
        "string.email": "Invalid email format",
        "string.empty": "Email is required",
        "any.required": "Email is required"
    })
});