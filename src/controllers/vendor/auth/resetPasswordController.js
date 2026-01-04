module.exports = class resetPasswordController {
    constructor(resetPasswordService, joi_resetPassword, validator) {
        this.resetPasswordService = resetPasswordService
        this.joi_resetPassword = joi_resetPassword
        this.validator = validator
    }

    renderResetPasswordPage(req,res){
        return res.render("vendor/auth/resetPassword",{
            error: null,
            newPassword: "",
            confirmPassword: ""
        })
    }

    async handleResetPassword(req,res){
        const vendorEmail = req.session.resetVendorEmail
        const vendorId = req.session.resetVendorId
        const {error,value} = this.validator.validate(this.joi_resetPassword, req.body)

        if (error) {
            const errorMessage = error.details[0].message;
            return res.render("vendor/auth/resetPassword", {
                error: errorMessage
            });
        }

        const {newPassword} = value

        try {
            await this.resetPasswordService.resetPassword(vendorEmail, newPassword, vendorId)

            delete req.session.resetVendorEmail
            delete req.session.resetVendorId

            return res.redirect("/vendor/auth/login?reset=success");
        } catch (error) {
            return res.render("vendor/auth/resetPassword", {
                error: err.message,
                newPassword: "",
                confirmPassword: ""
            });
        }
    }
}