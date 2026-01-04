const { compareString } = require("../../../utils/bcrypt");
module.exports = class LoginService{
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    async login(email, password){
        let normalizedEmail = email.toLowerCase().trim();
        let user = await this.userRepository.findByEmail(normalizedEmail)
        
        if (!user) {
            throw new Error("Invalid email or password");   
        }
        // Check if user is verified
        if (!user.isVerified) {
            throw new Error("Please verify your email first. Check your inbox for OTP.");
        }

        // Check if user has password (not Google-only user)
        if (!user.passwordHash) {
            throw new Error("This account uses Google login. Please login with Google.");
        }

        const isPasswordValid = await compareString(password, user.passwordHash)

        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = this.jwtService.generateTokens(
            user._id.toString(),
            user.email,
            user.role
        );

        // Save refresh token in database
        await this.userRepository.updateRefreshToken(user._id, refreshToken);

        // Sanitize user object (remove sensitive data)
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.passwordHash;
        delete userObj.refreshToken;

        return {
            user: userObj,
            accessToken,
            refreshToken
        };
    
    }

    async refreshAccessToken(refreshToken) {
        // Verify refresh token
        const decoded = this.jwtService.verifyRefreshToken(refreshToken);

        // Find user
        const user = await this.userRepository.findById(decoded.userId);

        if (!user) {
            throw new Error("User not found");
        }

        // Check if refresh token matches the one in database
        if (user.refreshToken !== refreshToken) {
            // Token reuse detected! Clear all tokens for security
            await this.userRepository.clearRefreshToken(user._id);
            throw new Error("Invalid refresh token. Please login again.");
        }

        // Generate new tokens (rotate refresh token)
        const newTokens = this.jwtService.generateTokens(
            user._id.toString(),
            user.email,
            user.role
        );

        // Update refresh token in database
        await this.userRepository.updateRefreshToken(user._id, newTokens.refreshToken);

        return newTokens;
    }

    async logout(userId) {
        // Clear refresh token from database
        await this.userRepository.clearRefreshToken(userId);
        return true;
    }
}