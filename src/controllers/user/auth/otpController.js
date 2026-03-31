import crypto from "crypto";
export default class OtpController {
    constructor(otpService, walletService) {
        this.otpService = otpService
        this.walletService = walletService
    }

    async renderOtpPage(req, res) {
        if (!req.session.tempUserId || !req.session.tempEmail) {
            return res.redirect("/auth/signup");
        }
        const timeRemaining = await this.otpService.getOtpTtl(req.session.tempUserId);
        res.render("user/auth/verifyOtp", {
            email: req.session.tempEmail,
            error: null,
            timeRemaining,
            success: null,
            info: "OTP has been sent to your email"
        });
    }

    async verifyOtp(req, res) {
        if (!req.session.tempUserId) {
            return res.redirect("/auth/signup");
        }
        const { otp } = req.body;
        const userId = req.session.tempUserId

        try {
            await this.otpService.verifyOtp(userId, otp)
            const user = await this.otpService.getUserById(userId)
            if (user.referredBy) {
                const userTransactionId = "TXN" + crypto.randomBytes(8).toString("hex").toUpperCase();
                await this.walletService.addMoney(200, userTransactionId, user._id, "credit", "referal_bonus")

                const referrerTransactionId = "TXN" + crypto.randomBytes(8).toString("hex").toUpperCase();
                await this.walletService.addMoney(300, referrerTransactionId, user.referredBy, "credit", "referal_bonus")
            }
            delete req.session.tempEmail;
            delete req.session.tempUserId;

            return res.json({
                success: true,
                message: "Signup successful! Welcome to Chronify"
            });

        } catch (error) {
            return res.status(400).json({
                success: false,
                error: error.message
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