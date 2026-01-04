module.exports = class OtpController {
    constructor(otpService) {
        this.otpService = otpService
    }

    renderOtpPage(req,res){
        if (!req.session.tempUserId || !req.session.tempEmail) {
            return res.redirect("/auth/signup");
        }
        res.render("user/auth/verifyOtp",{
            email: req.session.tempEmail,
            error: null,
            timeRemaining: 20 
        });
    }

    async verifyOtp(req,res){
        if (!req.session.tempUserId) {
            return res.redirect("/auth/signup");
        }
        const {otp} = req.body;
        const userId = req.session.tempUserId

        try {
            await this.otpService.verifyOtp(userId, otp)

            delete req.session.tempEmail;
            delete req.session.tempUserId;
            
            return res.redirect("/auth/login");

        } catch (error) {
            return res.render("user/auth/verifyOtp", {
                email: req.session.tempEmail,
                error: error.message,
                timeRemaining: 20 
            });
        }
    }

    async resendOtp(req, res) {
        const userId = req.session.tempUserId;
        const email = req.session.tempEmail;

        // Check if session data exists
        if (!userId || !email) {
            return res.status(400).json({ 
                success: false,
                error: "Session expired. Please signup again." 
            });
        }

        try {
            await this.otpService.resendOtp({ _id: userId, email });

            return res.json({ 
                success: true,
                message: "OTP resent successfully" 
            });

        } catch (err) {
            console.error("Resend OTP Error:", err);
            return res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
    }
}