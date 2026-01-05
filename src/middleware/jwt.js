const JwtService = require("../service/jwtService");
const UserRepository = require("../repository/user");

const jwtService = new JwtService();
const userRepository = new UserRepository();


async function verifyToken(req, res, next) {
    try {
        // Extract access token from cookies
        const { accessToken } = req.cookies;

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                error: "Authentication required. Please login."
            });
        }

        // Verify token
        const decoded = jwtService.verifyAccessToken(accessToken);

        // Find user in database
        const user = await userRepository.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found. Please login again."
            });
        }

        // Attach user to request object
        req.user = user;

        if (!user.isBlocked) {
            next();
        }


    } catch (err) {
        // Token expired or invalid
        if (err.message === "Access token expired") {
            return res.status(401).json({
                success: false,
                error: "Token expired. Please refresh.",
                code: "TOKEN_EXPIRED"
            });
        }

        return res.status(401).json({
            success: false,
            error: "Invalid authentication token."
        });
    }
}

module.exports = {
    verifyToken
};