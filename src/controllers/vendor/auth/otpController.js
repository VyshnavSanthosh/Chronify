module.exports = class OtpController {
    constructor(otpService) {
        this.otpService = otpService
    }

    renderOtpPage(req,res){
        return res.render("vendor/auth/verifyOtp",{
            email: req.session.tempVendorEmail,
            error: null,
            timeRemaining: 20
        })
    }

    async verifyOtp(req,res){
        const {otp} = req.body;
        const vendorId = req.session.tempVendorId

        try {
            await this.otpService.verifyOtp(vendorId, otp)

            delete req.session.tempVendorEmail
            delete req.session.tempVendorId
            return res.redirect("/vendor/auth/login")
        } catch (error) {
            return res.render("vendor/auth/verifyOtp", {
                email: req.session.tempVendorEmail,
                error: error.message,
                timeRemaining: 20 
            });
        }
    }

    async resendOtp(req, res) {
        const vendorId = req.session.tempVendorId;
        const email = req.session.tempVendorEmail;

        // Check if session data exists
        if (!vendorId || !email) {
            return res.status(400).json({ 
                success: false,
                error: "Session expired. Please signup again." 
            });
        }

        try {
            await this.otpService.resendOtp({ _id: vendorId, brandEmail: email });

            return res.json({ 
                success: true,
                message: "OTP resent successfully" 
            });

        } catch (err) {
            return res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
    }

}