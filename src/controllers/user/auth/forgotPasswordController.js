module.exports = class ForgotPasswordController {
    constructor(forgotPasswordService,joi_forgotPassword, joi_resetPassword, validator) {
        this.forgotPasswordService = forgotPasswordService
        this.joi_forgotPassword = joi_forgotPassword;
        this.joi_resetPassword = joi_resetPassword
        this.validator = validator;
    }

    // Render forgot password page
    renderForgotPassword(req,res){
        return res.render("user/auth/forgotPassword",{
            error: null,
            email: ""
        })
    }

    async handleForgotPassword(req,res){
        const {error, value} = this.validator.validate(this.joi_forgotPassword, req.body)

        if (error) {
            const errorMessage = error.details[0].message;
            return res.render("user/auth/forgotPassword",{
                error: errorMessage,
                email: req.body.email || ""
            })
        }

        const {email} = value;

        try {
            const result = await this.forgotPasswordService.requestPasswordReset(email)

            // Save email and userId in session for OTP verification
            req.session.resetEmail = result.email;
            req.session.resetUserId = result.userId;

            // Redirect to OTP verification page
            return res.redirect("/auth/forgot-password/verify-otp");

        } catch (err) {
            return res.render("user/auth/forgotPassword", {
                error: err.message,
                email: email
            });
        }
    }


    // Render OTP page
    renderVerifyOtp(req,res){
        const email = req.session.resetEmail
        
        // No email in session, redirect back to forgot password
        if (!email) {
            return res.redirect("/auth/forgot-password")
        }
        return res.render("user/auth/verifyOtpForgotPassword",{
            error: null,
            email: email,
            timeRemaining: 300 // 5 minutes in seconds
        })
    }

    async handleVerifyOtp(req,res){
        const {otp} = req.body;
        const userId = req.session.resetUserId;
        const email = req.session.resetEmail;
        
        if (!userId || !email) {
            return res.redirect("/auth/forgot-password")
        }

        try {
            await this.forgotPasswordService.verifyResetOtp(userId, otp)

            return res.redirect("/auth/reset-password")

        } catch (err) {
            return res.render("user/auth/verifyOtpForgotPassword", {
                email: email,
                error: err.message,
                timeRemaining: 300
            });
        }
    }

    async resendOtp(req, res) {
        const userId = req.session.resetUserId;
        const email = req.session.resetEmail;

        if (!userId || !email) {
            return res.status(400).json({ 
                success: false,
                error: "Session expired. Please start again." 
            });
        }

        try {
            await this.forgotPasswordService.resendResetOtp(userId, email);

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

    renderResetPassword(req,res){
        const userId = req.session.resetUserId
        const email = req.session.resetEmail

        if (!userId || !email) {
            return res.redirect("/auth/forgot-password")
        }
        return res.render("user/auth/resetPassword",{
            error: null
        })
    }

    async handleResetPassword(req,res){
        const userId = req.session.resetUserId;
        const email = req.session.resetEmail;

        if (!userId || !email) {
            return res.redirect("/auth/forgot-password");
        }

        const {error, value} = this.validator.validate(this.joi_resetPassword, req.body)

        if (error) {
            const errorMessage = error.details[0].message;
            return res.render("user/auth/resetPassword", {
                error: errorMessage
            });
        }

        const {newPassword} = value;

        try {
            await this.forgotPasswordService.resetPassword(userId, newPassword)

            // Clear session data
            delete req.session.resetEmail;
            delete req.session.resetUserId;

            // Redirect to login with success message
            return res.redirect("/auth/login?reset=success");

        } catch (err) {
            return res.render("user/auth/resetPassword", {
                error: err.message
            });
        }

    }


} 