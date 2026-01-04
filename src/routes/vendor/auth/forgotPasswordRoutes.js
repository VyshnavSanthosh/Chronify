const express = require("express");
const router = express.Router();

// Controller
const forgotPasswordControllerFile = require("../../../controllers/vendor/auth/forgotPasswordController")

const forgotPasswordOtpControllerFile = require("../../../controllers/vendor/auth/forgotPasswordOtpController")

const resetPasswordControllerFile = require("../../../controllers/vendor/auth/resetPasswordController")

// Service
const forgotPasswordServiceFile = require("../../../service/vendor/auth/forgotPasswordService");

const forgotPasswordOtpServiceFile = require("../../../service/vendor/auth/forgotPasswordOtpService");

const resetPasswordServiceFile = require("../../../service/vendor/auth/resetPasswordService");


// Repository
const vendorRepositoryFile = require("../../../repository/vendor");

// Utils
const redis = require("../../../utils/redis");
const generateOtp = require("../../../utils/generateOTP");

// Queue
const emailQueue = require("../../../queues/emailQueue");

// Validators
const joi_forgotPassword = require("../../../utils/validators/joi_forgotPassword");
const joi_resetPassword = require("../../../utils/validators/joi_resetPassword");
const validator = require("../../../utils/validators/validator");


// Dependency injection

const vendorRepository = new vendorRepositoryFile()

// Services
const forgotPasswordService = new forgotPasswordServiceFile(vendorRepository, redis, emailQueue, generateOtp)

const forgotPasswordOtpService = new forgotPasswordOtpServiceFile(vendorRepository, redis, generateOtp, emailQueue)

const resetPasswordService = new resetPasswordServiceFile(vendorRepository, redis)

// Controllers
const forgotPasswordController = new forgotPasswordControllerFile(forgotPasswordService, joi_forgotPassword, validator)

const forgotPasswordOtpController = new forgotPasswordOtpControllerFile(forgotPasswordOtpService)

const resetPasswordController = new resetPasswordControllerFile(resetPasswordService, joi_resetPassword, validator)


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

module.exports = router;