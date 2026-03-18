import fs from "fs";
import { uploadToCloudinary } from "../../../utils/cloudinary.js";
export default class UserProfileController {
    constructor(profileService, otpService) {
        this.profileService = profileService
        this.otpService = otpService
    }

    async renderProfilePage(req, res) {
        try {
            const { email } = req.user

            const user = await this.profileService.findUser(email)

            return res.render("user/profile/profile", {
                user
            })
        } catch (error) {
            console.log("Couldn't load profile page")

        }
    }

    async renderEditProfilePage(req, res) {
        try {
            const { email } = req.user

            const user = await this.profileService.findUser(email)
            return res.render("user/profile/editProfile", {
                user,
                verified: req.session.otpVerified
            })
        } catch (error) {
            console.log("Couldn't load profile page", error)

        }
    }

    async handleEditProfile(req, res) {
        try {
            const userObj = req.body
            const user = req.user
            const folderPath = `chronify/users/${user.firstName}-${user._id}`
            let imageObj = {}
            if (req.file) {
                try {
                    const result = await uploadToCloudinary(req.file.path, folderPath)
                    fs.unlink((req.file.path), (error) => {
                        if (error) {
                            console.log(error)
                        }
                    })
                    imageObj = {
                        url: result.secure_url,
                        publicId: result.public_id,
                        fileName: result.original_filename
                    }
                } catch (cloudinaryError) {
                    console.log("Couldn't upload to cloudiary", cloudinaryError)
                }
            }
            const updatedUser = await this.profileService.updateUser(userObj, user, imageObj)
            delete req.session.otpVerified
            return res.status(200).redirect("/profile")
        } catch (error) {
            console.log("Couldn't update user info", error)

        }
    }

    async sendOtp(req, res) {
        try {
            await this.otpService.sendOtp(req.user);
            return res.status(200).json({
                success: true,
                message: "OTP sent successfully"
            });
        } catch (error) {
            console.error("Error sending OTP:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to send OTP"
            });
        }
    }

    async resendOtp(req, res) {
        try {
            await this.otpService.resendOtp(req.user);
            return res.status(200).json({
                success: true,
                message: "OTP resent successfully"
            });
        } catch (error) {
            console.error("Error resending OTP:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to resend OTP"
            });
        }
    }

    async renderOtpPage(req, res) {
        const user = req.user
        return res.render("user/profile/otp", {
            email: user.email,
            error: null,
            timeRemaining: 120,
            success: null,
            info: "OTP has been sent to your email"
        })
    }

    async verifyOtp(req, res) {
        const { otp } = req.body
        const user = req.user
        try {
            await this.otpService.verifyOtp(user._id, otp)
            req.session.otpVerified = true
            console.log("verified : ", req.session.otpVerified)

            return res.redirect("/profile/edit")
        } catch (error) {
            req.session.otpVerified = false
            return res.render("user/profile/otp", {
                email: user.email,
                error: error.message,
                timeRemaining: 120,
                success: null,
                info: null
            });
        }

    }
}