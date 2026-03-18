import express from "express";
const router = express.Router();

import UserAuthController from "../../../controllers/user/auth/signupController.js";
import OtpController from "../../../controllers/user/auth/otpController.js";
import joi_signup from "../../../utils/validators/joi_signup.js";
import validator from "../../../utils/validators/validator.js";
import SignupService from "../../../service/user/auth/signupService.js";
import OtpService from "../../../service/user/auth/otpService.js";
import WalletServiceFile from "../../../service/user/wallet/walletService.js";
import UserRepository from "../../../repository/user.js";
import redis from "../../../utils/redis.js";
import WalletRepository from "../../../repository/user/walletRepository.js";
import generateOtp from "../../../utils/generateOTP.js";
import emailQueue from "../../../queues/emailQueue.js";
import WalletService from "../../../service/user/wallet/walletService.js";

// dependency injection
const userRepository = new UserRepository()
const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const signupService = new SignupService(userRepository)

const otpService = new OtpService(
    userRepository,
    redis,
    emailQueue,
    generateOtp
)

const signupController = new UserAuthController(
    signupService,
    otpService,
    joi_signup,
    validator
)

const otpController = new OtpController(otpService, walletService)

// AUTH SIGNUP
router.route("/signup")
    .get(signupController.renderSignup.bind(signupController))
    .post(signupController.handleSignup.bind(signupController));


router.route("/verify-otp")
    .get(otpController.renderOtpPage.bind(otpController))
    .post(otpController.verifyOtp.bind(otpController));

// RESEND OTP
router.post("/resend-otp",
    otpController.resendOtp.bind(otpController)
);
export default router;
