const express = require("express");
const router = express.Router();

// Controllers
const signupControllerFile = require("../../../controllers/vendor/auth/signupController")
const OtpController = require("../../../controllers/vendor/auth/otpController")

// Validators
const joi_VendorSignup = require('../../../utils/validators/joi_vendorSignup');
const validator = require('../../../utils/validators/validator');

// Services
const signupServiceFile = require("../../../service/vendor/auth/signupService")
const OtpService = require('../../../service/vendor/auth/otpService');

// Repository
const VendorRepository = require("../../../repository/vendor")

// Utils
const redis = require('../../../utils/redis');
const generateOtp = require("../../../utils/generateOTP");

// Queue
const emailQueue = require('../../../queues/emailQueue');


// ========== Dependency Injection ==========

const vendorRepository = new VendorRepository()

const signupService = new signupServiceFile(vendorRepository)

// Create otpService BEFORE signupController
const otpService = new OtpService(vendorRepository, redis, emailQueue, generateOtp)

// Pass otpService instance (not the class) to signupController
const signupController = new signupControllerFile(signupService, otpService, joi_VendorSignup, validator)

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

module.exports = router;