const jwt = require('jsonwebtoken');
const { jwt_access_secret, jwt_refresh_secret, jwt_access_expiry, jwt_refresh_expiry } = require("../config/index")

module.exports = class JwtService {
    

    // generate access 
    generateTokens(userId,email, role){
        const payload = {
            userId: userId,
            email: email,
            role: role
        }

        const accessToken = jwt.sign(payload,jwt_access_secret,{expiresIn: jwt_access_expiry})
        const refreshToken = jwt.sign({ userId: userId },jwt_refresh_secret,{expiresIn: jwt_refresh_expiry})

        return {
            accessToken,
            refreshToken
        }
    }

    verifyAccessToken(token){
        try {
            const decoded = jwt.verify(token, jwt_access_secret);
            return decoded;
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new Error("Access token expired");
            }
            throw new Error("Invalid access token");
        }
    }

    verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, jwt_refresh_secret);
            return decoded;
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new Error("Refresh token expired");
            }
            throw new Error("Invalid refresh token");
        }
    }
}