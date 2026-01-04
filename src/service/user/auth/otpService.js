module.exports = class OtpService {
    constructor(userRepository, redisClient, emailQueue, otpGenerator) {
        this.userRepository = userRepository;
        this.redis = redisClient;
        this.emailQueue = emailQueue;
        this.otpGenerator = otpGenerator;
    }
    async sendOtp(user){
        const otp = this.otpGenerator();
        try {
            await this.redis.set(`otp:${user._id}`, otp, "EX", 120)
    
            console.log(`DEBUG: enqueueing OTP job for user ${user._id} (email: ${user.email})`);

            await this.emailQueue.add("otp", {
                email: user.email,
                otp
            });
            return true;

        } catch (error) {
            await this.redis.del(`otp:${user._id}`);
            throw new Error("Failed to send OTP. Please try again.");
        }
        
    }

    async verifyOtp(userId, otpInput) {

        const attemptsKey = `otp:attempts:${userId}`;
        const attempts = Number(await this.redis.get(attemptsKey)) || 0;

        if (attempts >= 5) {
            throw new Error("Too many attempts. OTP blocked.");
        }
        const storedOtp = await this.redis.get(`otp:${userId}`);

        if (!storedOtp) {
            throw new Error("Otp expired or not found");
        }
        if (storedOtp !== otpInput) {
            await this.redis.incr(attemptsKey)
            await this.redis.expire(attemptsKey, 120);
            throw new Error("Invalid input");
        }
        await this.redis.del(`otp:${userId}`) // delete otp after verification
        await this.redis.del(attemptsKey);
        await this.userRepository.setVerified(userId); // sets isVerified = true in user db

        return true;
    }

    async resendOtp(user){
        const newOtp = this.otpGenerator();
        await this.redis.set(`otp:${user._id}`, newOtp, "EX", 120)
        await this.emailQueue.add("otp", {
            email: user.email,
            otp: newOtp
        })
        return true;
    }
}
1