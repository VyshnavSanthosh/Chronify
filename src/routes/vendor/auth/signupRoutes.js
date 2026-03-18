import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

import VendorSignupController from "../../../controllers/vendor/auth/signupController.js";
import OtpController from "../../../controllers/vendor/auth/otpController.js";
import joi_VendorSignup from "../../../utils/validators/joi_vendorSignup.js";
import validator from "../../../utils/validators/validator.js";
import VendorSignupService from "../../../service/vendor/auth/signupService.js";
import OtpService from "../../../service/vendor/auth/otpService.js";
import VendorRepository from "../../../repository/vendor.js";
import redis from "../../../utils/redis.js";
import generateOtp from "../../../utils/generateOTP.js";
import emailQueue from "../../../queues/emailQueue.js";


// ========== Dependency Injection ==========

const vendorRepository = new VendorRepository()

const signupService = new VendorSignupService(vendorRepository)

// Create otpService BEFORE signupController
const otpService = new OtpService(vendorRepository, redis, emailQueue, generateOtp)

// Pass otpService instance (not the class) to signupController
const signupController = new VendorSignupController(signupService, otpService, joi_VendorSignup, validator)

const otpController = new OtpController(otpService)


// ========== Routes ==========

// AUTH SIGNUP
router.route("/signup")
    .get(signupController.renderSignup.bind(signupController))
    .post(signupController.handleSignup.bind(signupController));

// VERIFY OTP
router.route("/verify-otp")
    .get(otpController.renderOtpPage.bind(otpController))
    .post(otpController.verifyOtp.bind(otpController));

// RESEND OTP
router.post("/resend-otp",
    otpController.resendOtp.bind(otpController)
);

export default router;