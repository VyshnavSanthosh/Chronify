module.exports = class VendorLoginController {
    constructor(loginService, jwtService, vendorRepository, joi_login, validator) {
        this.loginService = loginService;
        this.jwtService = jwtService;
        this.vendorRepository = vendorRepository;
        this.joi_login = joi_login;
        this.validator = validator;
    }

    renderLoginPage(req,res){
        return res.render("vendor/auth/login",{
            error: null,
            email: "",
            query: req.query
        })
    }

    async handleLogin(req,res){
        const {error, value} = this.validator.validate(this.joi_login, req.body)

        if (error) {
            const errorMessage = error.details[0].message;
            return res.render("vendor/auth/login", {
                error: errorMessage,
                email: req.body.email || "",
                query: req.query
            });
        }

        const {email, password} = value;
        
        try {
            const {accessToken, refreshToken} = await this.loginService.login(email, password)
            
            // Set HTTP-only cookies
            this.setAuthCookies(res,accessToken, refreshToken)

            return res.redirect("/home");

        } catch (error) {
            return res.render("vendor/auth/login", {
                error: error.message,
                email: email,
                query: req.query
            });
        }
    }

    setAuthCookies(res, accessToken, refreshToken) {
        // Access token cookie (15 minutes)
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: "lax",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        // Refresh token cookie (7 days)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: "Refresh token not found. Please login again."
                });
            }

            // Get new tokens
            const newTokens = await this.loginService.refreshAccessToken(refreshToken);

            // Set new cookies
            this.setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);

            return res.json({
                success: true,
                message: "Token refreshed successfully"
            });

        } catch (err) {
            // Clear invalid cookies
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            return res.status(401).json({
                success: false,
                error: err.message
            });
        }
    }


    async logout(req, res) {
        try {
            // req.user is set by authMiddleware
            const vendorId = req.user._id;

            // Clear refresh token from database
            await this.loginService.logout(vendorId);

            // Clear cookies
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            return res.redirect("/vendor/auth/login");

        } catch (err) {
            console.error("Logout Error:", err);
            return res.status(500).json({
                success: false,
                error: "Logout failed"
            });
        }
    }


}