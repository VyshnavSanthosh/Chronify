import express from "express";
const router = express.Router();

import passport from "../../../config/google.js";
import LoginController from "../../../controllers/user/auth/loginController.js";
import LoginService from "../../../service/user/auth/loginService.js";
import JwtService from "../../../service/jwtService.js";
import GoogleOauthService from "../../../service/user/auth/googleOauthService.js";
import UserRepository from "../../../repository/user.js";
import joi_login from "../../../utils/validators/joi_login.js";
import validator from "../../../utils/validators/validator.js";
import userJwtMiddlewareFile from "../../../middleware/userJwt.js";



// DEPENDENCY INJECTION 

const userRepository = new UserRepository();
const jwtService = new JwtService();
const loginService = new LoginService(userRepository, jwtService)
const googleOauthService = new GoogleOauthService(userRepository);
const userJwtMiddleware = new userJwtMiddlewareFile()
const loginController = new LoginController(
    loginService,
    googleOauthService,
    jwtService,
    userRepository,
    joi_login,
    validator
);


// Routes

// Regular login (email/password)
router.route("/login")
    .get(loginController.renderLogin.bind(loginController))
    .post(loginController.handleLogin.bind(loginController));

// Google OAuth - Initiate
router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// Google OAuth - Callback
router.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/auth/login",
        session: false  // We use JWT, not sessions
    }),
    loginController.handleGoogleCallback.bind(loginController)
);

// Refresh access token
router.post("/refresh-token",
    loginController.refreshToken.bind(loginController)
);

// Logout (protected route)
router.post("/logout",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),  // Middleware: verify user is logged in
    loginController.logout.bind(loginController)
);

router.get("/home",  userJwtMiddleware.verifyToken.bind(userJwtMiddleware), ((req, res) => {
    res.send("home page")
}))
export default router;