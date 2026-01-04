const express = require("express");
const router = express.Router();

// controllers
const signupControllerFile = require("../../../controllers/user/auth/signupController")
const OtpController = require("../../../controllers/user/auth/otpController")

// Validators
const joi_signup = require('../../../utils/validators/joi_signup');
const validator = require('../../../utils/validators/validator');

// Services
const signupServiceFile = require('../../../service/user/auth/signupService');
const OtpService = require('../../../service/user/auth/otpService');

// Repository
const UserRepository = require('../../../repository/user');

// Utils
const redis = require('../../../utils/redis');
const generateOtp = require("../../../utils/generateOTP");

// Queue
const emailQueue = require('../../../queues/emailQueue');

// dependency injection
const userRepository = new UserRepository()

const signupService = new signupServiceFile(userRepository)

const otpService = new OtpService(
    userRepository,
    redis,
    emailQueue,
    generateOtp
)

const signupController = new signupControllerFile(
    signupService,
    otpService, 
    joi_signup, 
    validator
)

const otpController = new OtpController(otpService)

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
module.exports = router;
