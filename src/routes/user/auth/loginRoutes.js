const express = require("express");
const router = express.Router();

// Passport for Google OAuth
const passport = require("../../../config/google");

// Controllers
const LoginController = require("../../../controllers/user/auth/loginController");

// Services
const LoginService = require("../../../service/user/auth/loginService");
const JwtService = require("../../../service/jwtService");
const GoogleOauthService = require("../../../service/user/auth/googleOauthService");

// Repository
const UserRepository = require("../../../repository/user");

// Validators
const joi_login = require("../../../utils/validators/joi_login");
const validator = require("../../../utils/validators/validator");

// Middleware
const { verifyToken } = require("../../../middleware/jwt");



// DEPENDENCY INJECTION 

const userRepository = new UserRepository();
const jwtService = new JwtService();
const loginService = new LoginService(userRepository, jwtService)
const googleOauthService = new GoogleOauthService(userRepository);

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
    verifyToken,  // Middleware: verify user is logged in
    loginController.logout.bind(loginController)
);

module.exports = router;