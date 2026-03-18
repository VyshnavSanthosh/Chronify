export default class BaseJwtMiddleware {
    constructor(jwtService, userRepository, loginService, accessTokenName, refreshTokenName, loginPath, requiredRole, blockMessage) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.loginService = loginService;
        this.accessTokenName = accessTokenName
        this.refreshTokenName = refreshTokenName
        this.loginPath = loginPath
        this.requiredRole = requiredRole
        this.blockMessage = blockMessage
    }

    async verifyToken(req, res, next) {
        const accessToken = req.cookies[this.accessTokenName];
        const refreshToken = req.cookies[this.refreshTokenName]

        const reject = (reason) => {
            console.log(`Authentication rejected: ${reason}. Clearing cookies and redirecting to ${this.loginPath}`);
            res.clearCookie(this.accessTokenName, { path: '/' });
            res.clearCookie(this.refreshTokenName, { path: '/' });
            return res.redirect(this.loginPath);
        };

        const authenticate = async (token) => {
            const decoded = this.jwtService.verifyAccessToken(token);
            const user = await this.userRepository.findById(decoded.userId);

            if (!user) throw new Error("USER_NOT_FOUND");
            if (user.isBlocked) throw new Error("ACCOUNT_BLOCKED");
            if (user.role != this.requiredRole) {
                console.log(`Role mismatch: expected ${this.requiredRole}, got ${user.role}`);
                throw new Error("UNAUTHORIZED_ROLE");
            }
            req.user = user;
            return user;
        };

        try {
            // 1. Try access token
            if (accessToken) {
                console.log(`${this.accessTokenName} found in cookies`);

                try {
                    await authenticate(accessToken);
                    console.log(`User ${req.user.email} authenticated via access token`);
                    return next();
                } catch (err) {
                    console.log(`Access token authentication failed: ${err.message}`);
                    if (err.message === "ACCOUNT_BLOCKED" || err.message === "UNAUTHORIZED_ROLE") {
                        return reject(err.message);
                    }
                    // If token is invalid or expired, continue to try refresh token
                }
            } else {
                console.log(`${this.accessTokenName} NOT found in cookies`);
            }

            // 2. Try refresh
            if (!refreshToken) {
                console.log(`${this.refreshTokenName} NOT found. Cannot refresh.`);
                return reject("NO_REFRESH_TOKEN");
            }

            console.log(`Attempting to refresh token using ${this.refreshTokenName}`);

            const newTokens = await this.loginService.refreshAccessToken(refreshToken);
            console.log("Token refreshed successfully");

            // Set new cookies
            res.cookie(this.accessTokenName, newTokens.accessToken, {
                httpOnly: true,
                secure: false, // Should be true in production
                sameSite: "lax",
                path: "/",
                maxAge: 15 * 60 * 1000
            });

            res.cookie(this.refreshTokenName, newTokens.refreshToken, {
                httpOnly: true,
                secure: false, // Should be true in production
                sameSite: "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // Authenticate with new token
            await authenticate(newTokens.accessToken);
            console.log(`User ${req.user.email} authenticated after token refresh`);
            return next();

        } catch (err) {
            console.error("Auth middleware error:", err.message);
            return reject(err.message);
        }
    }



}