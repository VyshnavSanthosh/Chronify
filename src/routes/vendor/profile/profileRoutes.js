import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

import { initialVerifyToken } from "../../../middleware/vendorInitialJwt.js";
import ProfileController from "../../../controllers/vendor/profile/profileController.js";
import ProfileService from "../../../service/vendor/profile/profileService.js";
import VendorRepository from "../../../repository/vendor.js";


// ========== Dependency Injection ==========

const vendorRepository = new VendorRepository()

const profileService = new ProfileService(vendorRepository)

const profileController = new ProfileController(profileService)


// ========== Routes ==========

// profile
router.route("/profile")
    .get(initialVerifyToken, profileController.renderProfilePage.bind(profileController))

export default router;