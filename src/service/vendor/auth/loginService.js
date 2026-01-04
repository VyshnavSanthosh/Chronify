const { compareString } = require("../../../utils/bcrypt");

module.exports = class loginService {
    constructor(vendorRepository, jwtService) {
        this.vendorRepository = vendorRepository;
        this.jwtService = jwtService
    }

    async login(email, password){
        const vendor = await this.vendorRepository.findByEmail(email)
        if (!vendor) {
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await compareString(password, vendor.passwordHash)

        if (!isPasswordValid) {
            throw new Error("Invalid email or password")
        }

        const {accessToken, refreshToken} = this.jwtService.generateTokens(vendor._id.toString(), vendor.brandEmail);

        await this.vendorRepository.updateRefreshToken(vendor._id, refreshToken);

        // Sanitize vendor object (remove sensitive data)
        const vendorObj = vendor.toObject ? vendor.toObject() : { ...vendor };
        delete vendorObj.passwordHash;
        delete vendorObj.refreshToken;

        return {
            vendor: vendorObj,
            accessToken,
            refreshToken
        };
    }

    async refreshAccessToken(refreshToken) {
        // Verify refresh token
        const decoded = this.jwtService.verifyRefreshToken(refreshToken);

        // Find vendor
        const vendor = await this.vendorRepository.findById(decoded.vendorId);

        if (!vendor) {
            throw new Error("vendor not found");
        }

        // Check if refresh token matches the one in database
        if (vendor.refreshToken !== refreshToken) {
            // Token reuse detected! Clear all tokens for security
            await this.vendorRepository.clearRefreshToken(vendor._id);
            throw new Error("Invalid refresh token. Please login again.");
        }

        // Generate new tokens (rotate refresh token)
        const newTokens = this.jwtService.generateTokens(
            vendor._id.toString(),
            vendor.brandEmail
        );

        // Update refresh token in database
        await this.vendorRepository.updateRefreshToken(vendor._id, newTokens.refreshToken);

        return newTokens;
    }

    async logout(vendorId) {
        // Clear refresh token from database
        await this.vendorRepository.clearRefreshToken(vendorId);
        return true;
    }



}