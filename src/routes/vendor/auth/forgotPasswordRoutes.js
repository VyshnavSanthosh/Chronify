import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

import ForgotPasswordController from "../../../controllers/vendor/auth/forgotPasswordController.js";
import ForgotPasswordOtpController from "../../../controllers/vendor/auth/forgotPasswordOtpController.js";
import ResetPasswordController from "../../../controllers/vendor/auth/resetPasswordController.js";
import ForgotPasswordService from "../../../service/vendor/auth/forgotPasswordService.js";
import ForgotPasswordOtpService from "../../../service/vendor/auth/forgotPasswordOtpService.js";
import ResetPasswordService from "../../../service/vendor/auth/resetPasswordService.js";
import VendorRepository from "../../../repository/vendor.js";
import redis from "../../../utils/redis.js";
import generateOtp from "../../../utils/generateOTP.js";
import emailQueue from "../../../queues/emailQueue.js";
import joi_forgotPassword from "../../../utils/validators/joi_forgotPassword.js";
import joi_resetPassword from "../../../utils/validators/joi_resetPassword.js";
import validator from "../../../utils/validators/validator.js";


// Dependency injection

const vendorRepository = new VendorRepository()

// Services
const forgotPasswordService = new ForgotPasswordService(vendorRepository, redis, emailQueue, generateOtp)

const forgotPasswordOtpService = new ForgotPasswordOtpService(vendorRepository, redis, generateOtp, emailQueue)

const resetPasswordService = new ResetPasswordService(vendorRepository, redis)

// Controllers
const forgotPasswordController = new ForgotPasswordController(forgotPasswordService, joi_forgotPassword, validator)

const forgotPasswordOtpController = new ForgotPasswordOtpController(forgotPasswordOtpService)

const resetPasswordController = new ResetPasswordController(resetPasswordService, joi_resetPassword, validator)


// Routes

//  forgot password page 
router.route("/forgot-password")
    .get(forgotPasswordController.renderForgotPasswordPage.bind(forgotPasswordController))
    .post(forgotPasswordController.handleForgotPassword.bind(forgotPasswordController));

// OTP verification page
router.route("/forgot-password/verify-otp")
    .get(forgotPasswordOtpController.renderVerifyOtpPage.bind(forgotPasswordOtpController))
    .post(forgotPasswordOtpController.verifyOtp.bind(forgotPasswordOtpController));

// Resend OTP
router.post("/forgot-password/resend-otp",
    forgotPasswordOtpController.resendOtp.bind(forgotPasswordOtpController)
);

// Reset password page
router.route("/reset-password")
    .get(resetPasswordController.renderResetPasswordPage.bind(resetPasswordController))
    .post(resetPasswordController.handleResetPassword.bind(resetPasswordController));

export default router;