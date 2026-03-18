import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        default: null
    },
    publicId: {
        type: String,
        default: null
    },
    fileName: {
        type: String,
        default: null
    }
}, { _id: false });

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

        isBlocked: {
            type: Boolean,
            default: false
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

        profileImage: {
            type: imageSchema,
        },

        refreshToken: {
            type: String,
            default: null,
        }

    },
    { timestamps: true }
)



export default mongoose.model("User", UserSchema);
