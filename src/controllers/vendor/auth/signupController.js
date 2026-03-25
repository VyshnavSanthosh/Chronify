export default class VendorAuthController {
    constructor(signupService, otpService, joi_signup, validator) {
        this.signupService = signupService
        this.otpService = otpService
        this.joi_signup = joi_signup;
        this.validator = validator;
    }

    renderSignup(req, res) {
        res.render("vendor/auth/vendorSignup", {
            errors: {},
            brandName: "",
            brandEmail: "",
            mobileNumber: "",
            password: "",
            confirmPassword: ""
        })
    }

    async handleSignup(req, res) {


        const { error, value } = this.validator.validate(this.joi_signup, req.body)

        let errors = {}
        if (error) {
            error.details.forEach(err => {
                errors[err.context.key] = err.message;
            });

            return res.render("vendor/auth/vendorSignup", {
                errors,
                brandName: value.brandName || "",
                brandEmail: value.brandEmail || "",
                mobileNumber: value.mobileNumber || "",
                password: value.password || "",
                confirmPassword: value.confirmPassword || ""
            })
        }

        const { brandName, brandEmail, mobileNumber, password } = value

        try {

            const vendor = await this.signupService.register({
                brandName,
                brandEmail,
                mobileNumber,
                password
            })


            // Store in session
            req.session.tempVendorId = vendor._id;
            req.session.tempVendorEmail = vendor.brandEmail;

            // Send initial OTP
            await this.otpService.sendOtp(vendor);

            // Redirect to OTP verification
            return res.redirect("/vendor/auth/verify-otp")

        } catch (error) {
            console.error("Signup error:", error.message)

            errors.general = error.message || "Something went wrong";

            return res.render("vendor/auth/vendorSignup", {
                errors,
                brandName: value.brandName || "",
                brandEmail: value.brandEmail || "",
                mobileNumber: value.mobileNumber || "",
                password: value.password || "",
                confirmPassword: value.confirmPassword || ""
            })
        }
    }
}