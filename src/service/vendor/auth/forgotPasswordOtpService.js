module.exports = class forgotPasswordOtpService {
    constructor(vendorRepository, redis, otpGenerator, emailQueue) {
        this.vendorRepository = vendorRepository
        this.redis = redis
        this.otpGenerator = otpGenerator
        this.emailQueue = emailQueue
    }

    async verifyResetOtp(vendorId, otp){
        const storedOtp = await this.redis.get(`forgot:${vendorId}`)

        if (!storedOtp) {
            throw new Error("OTP expired or not found. Please request a new one.");
        }

        if (storedOtp !== otp) {
            throw new Error("Invalid OTP. Please try again.");
        }
        return true
    }

    async resendOtp(vendorEmail, vendorId){
        const newOtp = await this.otpGenerator()

        await this.redis.set(`forgot:${vendorId}`,newOtp, "EX",300)

        console.log(`DEBUG: Resent password reset OTP for vendor ${vendorId}: ${newOtp}`);

        await this.emailQueue.add("vendor-forgot-password-otp",{
            email: vendorEmail,
            otp: newOtp
        })
        return true;
    }
}