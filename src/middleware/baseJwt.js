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
                throw new Error("UNAUTHORIZED_ROLE");
            }
            req.user = user;
            return user;
        };

        try {
            // 1. Try access token
            if (accessToken) {


                try {
                    await authenticate(accessToken);

                    return next();
                } catch (err) {
                    console.log(`Access token authentication failed: ${err.message}`);
                    if (err.message === "ACCOUNT_BLOCKED" || err.message === "UNAUTHORIZED_ROLE") {
                        return reject(err.message);
                    }
                    // If token is invalid or expired, continue to try refresh token
                }
            } 

            // 2. Try refresh
            if (!refreshToken) {
                console.log(`${this.refreshTokenName} NOT found. Cannot refresh.`);
                return reject("NO_REFRESH_TOKEN");
            }

            const newTokens = await this.loginService.refreshAccessToken(refreshToken);

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
            return next();

        } catch (err) {
            console.error("Auth middleware error:", err.message);
            return reject(err.message);
        }
    }



}