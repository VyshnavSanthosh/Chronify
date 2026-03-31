export default class forgotPasswordOtpController {
    constructor(forgotPasswordOtpService) {
        this.forgotPasswordOtpService = forgotPasswordOtpService
    }

    async renderVerifyOtpPage(req, res) {
        const vendorId = req.session.resetVendorId;
        const email = req.session.resetVendorEmail;

        if (!vendorId) {
            return res.redirect("/vendor/auth/forgot-password");
        }

        const timeRemaining = await this.forgotPasswordOtpService.getOtpTtl(vendorId);
        return res.render("vendor/auth/verifyOtpForgotPassword", {
            email: email,
            error: null,
            timeRemaining
        })
    }

    async verifyOtp(req, res) {

        const { otp } = req.body
        const vendorId = req.session.resetVendorId

        if (!vendorId) {
            return res.redirect("/vendor/auth/forgot-password");
        }

        try {
            await this.forgotPasswordOtpService.verifyResetOtp(vendorId, otp)
            return res.redirect("/vendor/auth/reset-password")

        } catch (error) {
            return res.render("vendor/auth/verifyOtpForgotPassword", {
                email: req.session.resetVendorEmail,
                error: error.message,
                timeRemaining: 300
            });
        }
    }

    async resendOtp(req, res) {
        const vendorEmail = req.session.resetVendorEmail
        const vendorId = req.session.resetVendorId

        if (!vendorId || !vendorEmail) {
            return res.status(400).json({
                success: false,
                error: "Session expired. Please start again."
            });
        }

        try {
            await this.forgotPasswordOtpService.resendOtp(vendorEmail, vendorId)
            return res.json({
                success: true,
                message: "OTP resent successfully"
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}