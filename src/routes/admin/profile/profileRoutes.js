import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

// Controllers
import profileControllerFile from "../../../controllers/admin/profile/profileController.js";
import profileServiceFile from "../../../service/admin/profile/profileService.js";
import userRepositoryFile from "../../../repository/user.js";

import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";

// Dependency Injection
const adminJwtMiddleware = new adminJwtMiddlewareFile();
const userRepository = new userRepositoryFile()
const profileService = new profileServiceFile(userRepository)
const profileController = new profileControllerFile(profileService);

// Routes
router.route("/profile")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), profileController.renderProfilePage.bind(profileController))

export default router;