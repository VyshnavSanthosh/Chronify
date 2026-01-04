const {hashString} = require("../../../utils/bcrypt")
module.exports = class resetPasswordService {
    constructor(vendorRepository, redis) {
        this.vendorRepository = vendorRepository
        this.redis = redis
    }

    async resetPassword(vendorEmail, password, vendorId){
        const vendor = await this.vendorRepository.findByEmail(vendorEmail)

        if (!vendor) {
            throw new Error("Vendor not found");
        }

        const hashedPassword = await hashString(password)

        vendor.passwordHash = hashedPassword

        await vendor.save();

        // Clear OTP from Redis (cleanup)
        await this.redis.del(`forgot:${vendorId}`);

        // Clear refresh token (force user to login again with new password)
        await this.vendorRepository.clearRefreshToken(vendorId);

        console.log(`✅ Password reset successful for vendor ${vendorId}`);

        return true;

    }
}