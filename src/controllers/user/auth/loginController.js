export default class LoginController {
    constructor(loginService, googleOauthService, jwtService, userRepository, joi_login, validator) {
        this.loginService = loginService;
        this.googleOauthService = googleOauthService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.joi_login = joi_login;
        this.validator = validator;
    }

    renderLogin(req, res) {
        const successMessage = req.session.successMessage || null;
        req.session.successMessage = null;

        return res.render("user/auth/login", {
            error: null,
            email: "",
            query: req.query,
            success: successMessage,
            info: null
        });
    }

    async handleLogin(req, res) {
        const { error, value } = this.validator.validate(this.joi_login, req.body);

        if (error) {
            const errorMessage = error.details[0].message;
            return res.render("user/auth/login", {
                error: errorMessage,
                email: req.body.email || "",
                query: req.query,
                success: null,
                info: null
            });
        }

        const { email, password } = value;

        try {
            const { user, userAccessToken, userRefreshToken } = await this.loginService.login(email, password);

            // Check if user is blocked
            if (user.isBlocked) {
                return res.render("user/auth/login", {
                    error: "Your account has been blocked. Please contact support.",
                    email: email,
                    query: req.query,
                    success: null,
                    info: null
                });
            }

            // Set HTTP-only cookies
            this.setAuthCookies(res, userAccessToken, userRefreshToken);

            // Redirect to home
            return res.redirect("/");

        } catch (err) {
            return res.render("user/auth/login", {
                error: err.message,
                email: email,
                query: req.query,
                success: null,
                info: null
            });
        }
    }

    async handleGoogleCallback(req, res) {
        try {
            console.log("Google callback initiated");
            const googleProfile = req.user;

            if (!googleProfile) {
                console.error("Google authentication failed - no profile in req.user");
                throw new Error("Google authentication failed");
            }

            console.log(`Processing Google login for: ${googleProfile.emails?.[0]?.value || 'ID: ' + googleProfile.id}`);
            const user = await this.googleOauthService.handleGoogleLogin(googleProfile);

            // Check if user is blocked
            if (user.isBlocked) {
                console.warn(`Blocked user attempted Google login: ${user.email}`);
                return res.render("user/auth/login", {
                    error: "Your account has been blocked. Please contact support.",
                    email: user.email,
                    query: req.query,
                    success: null,
                    info: null
                });
            }

            const { accessToken, refreshToken } = this.jwtService.generateTokens(
                user._id.toString(),
                user.email,
                user.role
            );

            console.log(`JWT tokens generated for user: ${user.email}`);

            const userAccessToken = accessToken
            const userRefreshToken = refreshToken
            await this.userRepository.updateRefreshToken(user._id, userRefreshToken);

            this.setAuthCookies(res, userAccessToken, userRefreshToken);

            console.log("Authentication cookies set, redirecting to home");
            return res.redirect("/");

        } catch (err) {
            console.error("Detailed Google OAuth Error:", err);
            return res.redirect(`/auth/login?error=google_auth_failed&message=${encodeURIComponent(err.message)}`);
        }
    }

    setAuthCookies(res, userAccessToken, userRefreshToken) {
        console.log("Setting auth cookies with path '/'");
        res.cookie("userAccessToken", userAccessToken, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie("userRefreshToken", userRefreshToken, {
            httpOnly: true,
            secure: false, // Set to true in production
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }

    async refreshToken(req, res) {
        try {
            const { userRefreshToken } = req.cookies;

            if (!userRefreshToken) {
                return res.status(401).json({
                    success: false,
                    error: "Refresh token not found. Please login again.",
                    code: "NO_REFRESH_TOKEN"
                });
            }

            // Get new tokens
            const newTokens = await this.loginService.refreshAccessToken(userRefreshToken);

            // Set new cookies
            this.setAuthCookies(res, newTokens.userAccessToken, newTokens.userRefreshToken);

            return res.json({
                success: true,
                message: "Token refreshed successfully"
            });

        } catch (err) {
            console.error("Token refresh error:", err.message);

            // Clear invalid cookies
            res.clearCookie("userAccessToken");
            res.clearCookie("userRefreshToken");

            return res.status(401).json({
                success: false,
                error: err.message,
                code: "REFRESH_FAILED"
            });
        }
    }

    async logout(req, res) {
        try {
            // req.user is set by authMiddleware
            const userId = req.user._id;

            // Clear refresh token from database
            await this.loginService.logout(userId);

            // Clear cookies
            res.clearCookie("userAccessToken");
            res.clearCookie("userRefreshToken");

            return res.redirect("/auth/login?logout=success");

        } catch (err) {
            console.error("Logout Error:", err);

            // Even if DB update fails, clear cookies
            res.clearCookie("userAccessToken");
            res.clearCookie("userRefreshToken");

            return res.redirect("/auth/login?logout=success");
        }
    }
}