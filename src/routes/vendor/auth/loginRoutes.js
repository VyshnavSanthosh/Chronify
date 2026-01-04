const express = require("express");
const router = express.Router();

// Controller file
const loginControllerFile = require("../../../controllers/vendor/auth/loginController");

// Service file
const loginServiceFile = require("../../../service/vendor/auth/loginService")
const jwtServiceFile = require("../../../service/jwtService")

// Repository
const vendorRepositoryFile = require("../../../repository/vendor")

// Validators
const joi_login = require("../../../utils/validators/joi_login");
const validator = require("../../../utils/validators/validator");

// Middleware
const { verifyToken } = require("../../../middleware/jwt");


// DEPENDENCY INJECTION 

const vendorRepository = new vendorRepositoryFile()

const jwtService = new jwtServiceFile()

const loginService = new loginServiceFile(vendorRepository, jwtService)

const loginController = new loginControllerFile(loginService, jwtService, vendorRepository, joi_login, validator)


router.route("/login")
    .get(loginController.renderLoginPage.bind(loginController))
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