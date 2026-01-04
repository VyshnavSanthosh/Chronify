const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },

        lastName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        passwordHash: {
            type: String,
            required: false,
        },

        phone: {
            type: String,
            default: null,
        },

        role: {
            type: String,
            enum: ["admin", "customer"],
            default: "customer",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        referralCode: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },

        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // allows null values while maintaining uniqueness
            index: true,
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        refreshToken: {
            type: String,
            default: null,
        }

    },
    { timestamps: true } 
)



module.exports = mongoose.model("User", UserSchema);
