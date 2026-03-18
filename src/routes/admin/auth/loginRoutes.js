import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

// Controllers
import LoginController from "../../../controllers/admin/auth/loginController.js";
import LoginService from "../../../service/admin/auth/loginService.js";
import JwtService from "../../../service/jwtService.js";
import UserRepository from "../../../repository/user.js";
import joi_login from "../../../utils/validators/joi_login.js";
import validator from "../../../utils/validators/validator.js";
import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";


// DEPENDENCY INJECTION 

const userRepository = new UserRepository();
const jwtService = new JwtService();
const loginService = new LoginService(jwtService, userRepository)
const adminJwtMiddleware = new adminJwtMiddlewareFile();
const loginController = new LoginController(
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
    adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),   // Middleware: verify user is logged in
    loginController.logout.bind(loginController)
);

export default router;