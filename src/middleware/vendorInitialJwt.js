import JwtService from "../service/jwtService.js";
import VendorRepository from "../repository/vendor.js";
import LoginService from "../service/vendor/auth/loginService.js";

const jwtService = new JwtService();
const vendorRepository = new VendorRepository();
const loginService = new LoginService(vendorRepository, jwtService);

async function initialVerifyToken(req, res, next) {
    const { vendorAccessToken, vendorRefreshToken } = req.cookies;

    
    const reject = () => {
        res.clearCookie("vendorAccessToken");
        res.clearCookie("vendorRefreshToken");
        return res.redirect("/vendor/auth/login");
    };

    // Helper: authenticate user from access token
    const authenticate = async (token) => {
        const decoded = jwtService.verifyAccessToken(token);
        
        const vendor = await vendorRepository.findById(decoded.userId);

        if (!vendor) throw new Error("Vendor_NOT_FOUND");
        if (vendor.isBlocked) throw new Error("ACCOUNT_BLOCKED");

        req.vendor = vendor;
    };

    try {
        // 1. Try access token first
        if (vendorAccessToken) {
        try {
            await authenticate(vendorAccessToken);
            return next();
        } catch (err) {
            if (err.message === "ACCOUNT_BLOCKED") {
            return res.status(403).send("Account blocked. Please contact support.");
            }
            // Otherwise fall through and try refresh
        }
        }

        // 2. Try refresh token
        if (!vendorRefreshToken) return reject();

        const newTokens = await loginService.refreshAccessToken(vendorRefreshToken);

        // Set new cookies
        res.cookie("vendorAccessToken", newTokens.vendorAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie("vendorRefreshToken", newTokens.vendorRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Authenticate with new access token
        await authenticate(newTokens.vendorAccessToken);
        return next();

    } catch (err) {
        console.error("Vendor auth error:", err);
        return reject();
    }
}

export { initialVerifyToken };
