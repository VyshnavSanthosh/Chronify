module.exports = class ForgotPasswordController {
    constructor(forgotPasswordService,joi_forgotPassword, validator) {
        this.forgotPasswordService = forgotPasswordService
        this.joi_forgotPassword = joi_forgotPassword;
        this.validator = validator;
    }

    renderForgotPasswordPage(req,res){
        res.render("vendor/auth/forgotPassword",{
            email: "",
            error: null
        })
    }

    async handleForgotPassword(req,res){
        const {error, value} = this.validator.validate(this.joi_forgotPassword, req.body)

        if (error) {
            const errorMessage = error.details[0].message;
            return res.render("vendor/auth/forgotPassword",{
                error: errorMessage,
                email: req.body.email || ""
            })
        }

        const {email} = value

        try {
            const result = await this.forgotPasswordService.requestPasswordReset(email)

            req.session.resetVendorEmail = result.email
            req.session.resetVendorId = result.vendorId

            return res.redirect("/vendor/auth/forgot-password/verify-otp")

        } catch (error) {
            return res.render("vendor/auth/forgotPassword", {
                error: error.message,
                email: email
            });
        }
        
    }

}