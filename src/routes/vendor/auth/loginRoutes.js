import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

import VendorLoginController from "../../../controllers/vendor/auth/loginController.js";
import LoginService from "../../../service/vendor/auth/loginService.js";
import JwtService from "../../../service/jwtService.js";
import VendorRepository from "../../../repository/vendor.js";
import joi_login from "../../../utils/validators/joi_login.js";
import validator from "../../../utils/validators/validator.js";
import { initialVerifyToken } from "../../../middleware/vendorInitialJwt.js";


// DEPENDENCY INJECTION 

const vendorRepository = new VendorRepository()

const jwtService = new JwtService()

const loginService = new LoginService(vendorRepository, jwtService)

const loginController = new VendorLoginController(loginService, jwtService, vendorRepository, joi_login, validator)


router.route("/login")
    .get(loginController.renderLoginPage.bind(loginController))
    .post(loginController.handleLogin.bind(loginController));

// Refresh access token
router.post("/refresh-token",
    loginController.refreshToken.bind(loginController)
);

// Logout (protected route)
router.post("/logout",
    initialVerifyToken,  // Middleware: verify user is logged in
    loginController.logout.bind(loginController)
);

export default router;