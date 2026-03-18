export default class AdminAuthController {
    constructor(loginService, jwtService, joi_login, validator) {
        this.loginService = loginService
        this.jwtService = jwtService
        this.joi_login = joi_login
        this.validator = validator
    }

    rendorLoginPage(req, res) {
        return res.render("admin/auth/login", {
            email: "",
            error: null,
            query: req.query
        })
    }

    async handleLogin(req, res) {

        const { error, value } = this.validator.validate(this.joi_login, req.body)

        if (error) {
            return res.render("admin/auth/login", {
                error: error.details[0].message,
                email: req.body.email || "",
                query: req.query
            });
        }

        const { email, password } = value

        try {
            const { adminAccessToken, adminRefreshToken } = await this.loginService.login(email, password)

            res.cookie("adminAccessToken", adminAccessToken, {
                httpOnly: true,
                secure: false, // true in production (HTTPS)
                sameSite: "lax",
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            res.cookie("adminRefreshToken", adminRefreshToken, {
                httpOnly: true,
                secure: false, // true in production (HTTPS)
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            return res.redirect("/admin/profile")

        } catch (error) {
            return res.render("admin/auth/login", {
                error: error.message,
                email: email,
                query: req.query
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const { adminRefreshToken } = req.cookies;

            if (!adminRefreshToken) {
                return res.status(401).json({
                    success: false,
                    error: "Refresh token not found. Please login again."
                });
            }

            const newTokens = await this.loginService.refreshAccessToken(adminRefreshToken)

            res.cookie("adminAccessToken", newTokens.accessToken, {
                httpOnly: true,
                secure: false, // true in production (HTTPS)
                sameSite: "lax",
                maxAge: 15 * 60 * 1000 // 15 minutes
            })

            res.cookie("adminRefreshToken", newTokens.refreshToken, {
                httpOnly: true,
                secure: false, // true in production (HTTPS)
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
        return res.json({ success: true, message: "Token refreshed successfully" });


        } catch (error) {
            console.error("Refresh token error:", error);
            return res.status(401).json({
                success: false,
                error: error.message,
                code: "REFRESH_FAILED"
            });
        }
    }

    async logout(req, res) {
        try {
            // req.user is set by jwt middleware
            const userId = req.user._id;

            // Clear refresh token from database
            await this.loginService.logout(userId);

            // Clear cookies
            res.clearCookie("adminAccessToken");
            res.clearCookie("adminRefreshToken");

            return res.redirect("/admin/auth/login");

        } catch (err) {
            console.error("Logout Error:", err);
            return res.status(500).json({
                success: false,
                error: "Logout failed"
            });
        }
    }
}