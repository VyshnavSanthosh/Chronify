module.exports = class forgotPasswordService {
    constructor(vendorRepository, redisClient, emailQueue, otpGenerator) {
        this.vendorRepository = vendorRepository
        this.redis = redisClient;
        this.emailQueue = emailQueue;
        this.otpGenerator = otpGenerator;
    }

    async requestPasswordReset(email){
        if (!email) {
            throw new Error("Email Required");
        }
        const vendor = await this.vendorRepository.findByEmail(email)

        if (!vendor) {
            throw new Error("User not found in this email");
        }

        const otp = this.otpGenerator()

        await this.redis.set(`forgot:${vendor._id}`,otp,"EX", 300);

        await this.emailQueue.add("vendor-forgot-password-otp",{
            email: vendor.brandEmail,
            otp: otp
        })

        return {
            email: vendor.brandEmail,
            vendorId: vendor._id
        }
    }
}