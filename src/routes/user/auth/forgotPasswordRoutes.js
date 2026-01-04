const express = require("express");
const router = express.Router();

// Controller
const ForgotPasswordController = require("../../../controllers/user/auth/forgotPasswordController");

// Service
const ForgotPasswordService = require("../../../service/user/auth/forgotPasswordService");

// Repository
const UserRepository = require("../../../repository/user");

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

const userRepository = new UserRepository();

const forgotPasswordService = new ForgotPasswordService(
    userRepository,
    redis,
    emailQueue,
    generateOtp
)
const forgotPasswordController = new ForgotPasswordController(
    forgotPasswordService,
    joi_forgotPassword,
    joi_resetPassword,
    validator
)


// Routes

//  forgot password page 
router.route("/forgot-password")
    .get(forgotPasswordController.renderForgotPassword.bind(forgotPasswordController))
    .post(forgotPasswordController.handleForgotPassword.bind(forgotPasswordController));

// OTP verification page
router.route("/forgot-password/verify-otp")
    .get(forgotPasswordController.renderVerifyOtp.bind(forgotPasswordController))
    .post(forgotPasswordController.handleVerifyOtp.bind(forgotPasswordController));

// Resend OTP
router.post("/forgot-password/resend-otp",
    forgotPasswordController.resendOtp.bind(forgotPasswordController)
);

// Reset password page & handle password reset
router.route("/reset-password")
    .get(forgotPasswordController.renderResetPassword.bind(forgotPasswordController))
    .post(forgotPasswordController.handleResetPassword.bind(forgotPasswordController));

module.exports = router;