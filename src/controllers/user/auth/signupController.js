module.exports = class UserAuthController {
    constructor(signupService, otpService, joi_signup, validator){
        this.signupService = signupService
        this.otpService = otpService
        this.joi_signup = joi_signup;
        this.validator = validator;
    }
    renderSignup(req,res){
        return res.render("user/auth/signup",{
            errors: {},
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            referralCode: ""
        })
    }
    async handleSignup(req,res) {
        
        // Joi validator
        const {error, value} = this.validator.validate(this.joi_signup, req.body)

        let errors = {}

        if (error) {
            error.details.forEach(err => {
                errors[err.context.key] = err.message;
            });

            return res.render("user/auth/signup", {
                errors,
                firstName: value.firstName || "",
                lastName: value.lastName || "",
                email: value.email || "",
                phone: value.phone || "",
                referralCode: value.referralCode || ""
            });
        }

        const { firstName, lastName, email, phone, password, referralCode } = value;

        try {
            const user = await this.signupService.register({
                firstName,
                lastName,
                email,
                phone,
                password,
                referralCode
            })

            // Save temporarily for OTP flow
            req.session.tempUserId = user._id;
            req.session.tempEmail = user.email;

            await this.otpService.sendOtp(user)
            return res.redirect("/auth/verify-otp");
        } catch (error) {
            errors.general = error.message || "Something went wrong";
            return res.render("user/auth/signup", {
                errors,
                firstName,
                lastName,
                email,
                phone,
                referralCode
            });
        }
    }

}

