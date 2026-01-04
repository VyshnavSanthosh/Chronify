const {compareString} = require("../../../utils/bcrypt")
module.exports = class LoginService {
    constructor(jwtService, userRepository) {
        this.jwtService = jwtService
        this.userRepository = userRepository
    }

    async login(email, password){
        const admin = await this.userRepository.findByEmail(email)
        
        if (!admin) {
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await compareString(password, admin.passwordHash)

        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        const {accessToken, refreshToken} = this.jwtService.generateTokens(
            admin._id.toString(),
            admin.email,
            admin.role
        )

        // Save refresh token in database
        await this.userRepository.updateRefreshToken(admin._id, refreshToken);

        // Sanitize admin object (remove sensitive data)
        const adminObj = admin.toObject ? admin.toObject() : { ...admin };
        delete adminObj.passwordHash;
        delete adminObj.refreshToken;

        return {
            admin: adminObj,
            accessToken,
            refreshToken
        };
    }

    async refreshAccesToken(refreshToken){

        const decoded = await this.jwtService.verifyRefreshToken(refreshToken)

        const admin = await this.userRepository.findById(decoded.userId) // decoded will have payload data

        if (!admin) {
            throw new Error("User not found");
        }

        if (admin.refreshToken !== refreshToken) {
            // Clear all tokens for security
            await this.userRepository.clearRefreshToken(admin._id);
            throw new Error("Invalid refresh token. Please login again.");
        }

        const newTokens = this.jwtService.generateTokens(
            admin._id.toString(),
            admin.email,
            admin.role
        )

         // Update refresh token in database
        await this.userRepository.updateRefreshToken(admin._id, newTokens.refreshToken);

        return newTokens

    }

    async logout(adminId){
        // Clear refresh token from database
        await this.userRepository.clearRefreshToken(adminId);
        return true;
    }
}