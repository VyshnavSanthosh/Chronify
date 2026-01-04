module.exports = class AdminAuthController {
    constructor(loginService, jwtService, joi_login, validator) {
        this.loginService = loginService
        this.jwtService = jwtService
        this.joi_login = joi_login
        this.validator = validator
    }

    rendorLoginPage(req,res){
        return res.render("admin/auth/login",{
            email: "",
            error: null,
            query: req.query
        })
    }

    async handleLogin(req,res){
        const {error, value} = this.validator.validate(this.joi_login, req)

        if (error) {
            return res.render("vendor/auth/login", {
                error: error.details[0].message,
                email: req.body.email || "",
                query: req.query
            });
        }

        const {email, password} = value

        try {
            const {accessToken, refreshToken} = await this.loginService.login(email, password)

            res.cookie("accessToken",accessToken,{
                httpOnly: true,
                secure: false, // true in production (HTTPS)
                sameSite: "lax",
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            res.cookie("refreshToken",refreshToken,{
                httpOnly: true,
                secure: false, // true in production (HTTPS)
                sameSite: "lax",
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            return res.redirect("/home")

        } catch (error) {
            return res.render("admin/auth/login", {
                error: error.message,
                email: email,
                query: req.query
            });
        }
    }

    async refreshToken(req,res){
        try {
            const {refreshToken} = req.cookies;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: "Refresh token not found. Please login again."
                });
            }

            const newTokens = this.loginService.refreshAccessToken(refreshToken)

            es.cookie("accessToken",newTokens.accessToken,{
                httpOnly: true,
                secure: false, // true in production (HTTPS)
                sameSite: "lax",
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            res.cookie("refreshToken",newTokens.refreshToken,{
                httpOnly: true,
                secure: false, // true in production (HTTPS)
                sameSite: "lax",
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

        } catch (error) {
            
        }
    }

    async logout(req, res) {
        try {
            // req.user is set by jwt middleware
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