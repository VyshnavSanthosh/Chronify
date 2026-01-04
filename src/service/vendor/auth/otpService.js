module.exports = class OtpService {
    constructor(vendorRepository, redisClient, emailQueue, otpGenerator) {
        this.vendorRepository = vendorRepository;
        this.redis = redisClient;
        this.emailQueue = emailQueue;
        this.otpGenerator = otpGenerator;
    }

    async sendOtp(vendor){
        const otp = this.otpGenerator()
        try {
            await this.redis.set(`otp:${vendor._id}`, otp, "EX", 120)
        
            await this.emailQueue.add("vendor-otp",{
                email: vendor.brandEmail,
                otp
            })
            return true
        } catch (error) {
            await this.redis.del(`otp:${vendor._id}`);
            throw new Error("Failed to send OTP. Please try again.");
        }

    }

    async verifyOtp(vendorId, otp){

        const attemptsKey = `otp:attempts:${vendorId}`;
        const attempts = Number(await this.redis.get(attemptsKey)) || 0;

        if (attempts >= 5) {
            throw new Error("Too many attempts. OTP blocked.");
        }

        const storedOtp = await this.redis.get(`otp:${vendorId}`)

        if (!storedOtp) {
                throw new Error("Otp expired or not found");
        }

        if (storedOtp != otp) {
            await this.redis.incr(attemptsKey)
            await this.redis.expire(attemptsKey, 120);
            throw new Error("Invalid input");
        }
        

        await this.redis.del(`otp:${vendorId}`)
        await this.redis.del(attemptsKey);
        await this.vendorRepository.setVerified(vendorId)

        return true;
    }

    async resendOtp(vendor){
        const newOtp = this.otpGenerator();
        await this.redis.set(`otp:${vendor._id}`, newOtp, "EX", 120)
        await this.emailQueue.add("otp", {
            email: vendor.brandEmail,
            otp: newOtp
        })
        return true;
    }

}