const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
            required: true,
        },

        brandEmail: {
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

        mobileNumber: {
            type: String,
            default: null,
        },

        role: {
            type: String,
            default: "vendor",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        refreshToken: {
            type: String,
            default: null,
        },

    },
    { timestamps: true } 
)



module.exports = mongoose.model("Vendor", VendorSchema);
