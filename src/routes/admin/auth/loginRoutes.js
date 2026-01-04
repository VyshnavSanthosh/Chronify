const express = require("express");
const router = express.Router();

// Controllers
const loginControllerFile = require("../../../controllers/admin/auth/loginController");

// Services
const loginServiceFile = require("../../../service/admin/auth/loginService");
const jwtServiceFile = require("../../../service/jwtService");

// Repository
const userRepositoryFile = require("../../../repository/user");

// Validators
const joi_login = require("../../../utils/validators/joi_login");
const validator = require("../../../utils/validators/validator");

// Middleware
const { verifyToken } = require("../../../middleware/jwt");


// DEPENDENCY INJECTION 

const userRepository = new userRepositoryFile();
const jwtService = new jwtServiceFile();
const loginService = new loginServiceFile(userRepository, jwtService)

const loginController = new loginControllerFile(
    loginService,
    jwtService,
    joi_login,
    validator
)

// Routes

router.route("/login")
    .get(loginController.rendorLoginPage.bind(loginController))
    .post(loginController.handleLogin.bind(loginController));

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