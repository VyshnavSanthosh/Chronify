import express from "express";
const router = express.Router();

import ForgotPasswordController from "../../../controllers/user/auth/forgotPasswordController.js";
import ForgotPasswordService from "../../../service/user/auth/forgotPasswordService.js";
import UserRepository from "../../../repository/user.js";
import redis from "../../../utils/redis.js";
import generateOtp from "../../../utils/generateOTP.js";
import emailQueue from "../../../queues/emailQueue.js";
import joi_forgotPassword from "../../../utils/validators/joi_forgotPassword.js";
import joi_resetPassword from "../../../utils/validators/joi_resetPassword.js";
import validator from "../../../utils/validators/validator.js";


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

export default router;