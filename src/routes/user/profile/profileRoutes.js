import express from "express";
const router = express.Router();

import noCache from "../../../middleware/nocache.js";
router.use(noCache);
// Controllers
import profileControllerFile from "../../../controllers/user/profile/userProfileController.js";
import profileServiceFile from "../../../service/admin/profile/profileService.js";
import otpServiceFile from "../../../service/user/auth/otpService.js";
import userRepositoryFile from "../../../repository/user.js";

import userJwtMiddlewareFile from "../../../middleware/userJwt.js";

import redis from "../../../utils/redis.js";
import generateOtp from "../../../utils/generateOTP.js";
import emailQueue from "../../../queues/emailQueue.js";

import createUploader from "../../../utils/multer.js";

// Dependency Injection
const userJwtMiddleware = new userJwtMiddlewareFile();
const userRepository = new userRepositoryFile()
const profileService = new profileServiceFile(userRepository)
const otpService = new otpServiceFile(userRepository, redis, emailQueue, generateOtp);
const profileController = new profileControllerFile(profileService, otpService);

const imgUpload = createUploader("IMAGES", "src/public/uploads", 10 * 1024 * 1024)

// Routes
router.route("/profile")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),profileController.renderProfilePage.bind(profileController))

router.route("/profile/edit")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),profileController.renderEditProfilePage.bind(profileController))
    .post(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), imgUpload.single("profileImage"),profileController.handleEditProfile.bind(profileController))

router.post("/profile/send-otp",userJwtMiddleware.verifyToken.bind(userJwtMiddleware),profileController.sendOtp.bind(profileController))

router.route("/profile/verify-otp")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),profileController.renderOtpPage.bind(profileController))
    .post(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),profileController.verifyOtp.bind(profileController))

router.post("/profile/resend-otp",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),profileController.resendOtp.bind(profileController)
);

export default router;
