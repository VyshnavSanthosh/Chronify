const { hashString } = require("../../../utils/bcrypt");
module.exports = class ForgotPasswordService {
    constructor(userRepository, redisClient, emailQueue, otpGenerator) {
        this.userRepository = userRepository;
        this.redis = redisClient;
        this.emailQueue = emailQueue;
        this.otpGenerator = otpGenerator;
    }

    async requestPasswordReset(email) {
        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const user = await this.userRepository.findByEmail(normalizedEmail);

        if (!user) {
            throw new Error("No account found with this email address");
        }

        // Check if user signed up with Google (no password to reset)
        if (user.authProvider === "google" && !user.passwordHash) {
            throw new Error("This account uses Google login. Password reset is not available.");
        }

        // Generate OTP
        const otp = this.otpGenerator();

        // Store OTP in Redis with prefix "forgot:" (5 minutes expiry)
        await this.redis.set(`forgot:${user._id}`, otp, "EX", 300); // 300 seconds = 5 minutes

        console.log(`DEBUG: Password reset OTP for user ${user._id} (email: ${user.email}): ${otp}`);

        // Send OTP email
        await this.emailQueue.add("forgot-password-otp", {
            email: user.email,
            otp: otp
        });

        return {
            email: user.email,
            userId: user._id,
            message: "OTP sent to your email"
        };
    }

    async verifyResetOtp(userId, otp) {
        // Get OTP from Redis
        const storedOtp = await this.redis.get(`forgot:${userId}`);

        if (!storedOtp) {
            throw new Error("OTP expired or not found. Please request a new one.");
        }

        if (storedOtp !== otp) {
            throw new Error("Invalid OTP. Please try again.");
        }

        // Don't delete OTP yet - we need it for the reset password step
        // We'll delete it after password is successfully reset
        return true;
    }

    async resetPassword(userId, newPassword) {
        // Find user
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Hash new password
        const hashedPassword = await hashString(newPassword);

        // Update password in database
        user.passwordHash = hashedPassword;
        
        // If user was Google-only, now they have a password (set authProvider to local)
        if (user.authProvider === "google") {
            user.authProvider = "local";
        }

        await user.save();

        // Clear OTP from Redis (cleanup)
        await this.redis.del(`forgot:${userId}`);

        // Clear refresh token (force user to login again with new password)
        await this.userRepository.clearRefreshToken(userId);

        console.log(`✅ Password reset successful for user ${userId}`);

        return true;
    }

    async resendResetOtp(userId, email) {
        // Generate new OTP
        const newOtp = this.otpGenerator();

        // Store in Redis with prefix "forgot:" (5 minutes expiry)
        await this.redis.set(`forgot:${userId}`, newOtp, "EX", 300);

        console.log(`DEBUG: Resent password reset OTP for user ${userId}: ${newOtp}`);

        // Send OTP email
        await this.emailQueue.add("forgot-password-otp", {
            email: email,
            otp: newOtp
        });

        return true;
    }
}