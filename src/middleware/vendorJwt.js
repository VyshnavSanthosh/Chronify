const JwtService = require("../service/jwtService");
const VendorRepository = require("../repository/vendor");

const jwtService = new JwtService();
const vendorRepository = new VendorRepository();


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
        const vendor = await vendorRepository.findById(decoded.userId);

        if (!vendor) {
            return res.status(401).json({
                success: false,
                error: "Vendor not found. Please login again."
            });
        }

        // Attach user to request object
        req.vendor = vendor;        
        // Pass control to next middleware/controller
        next();

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