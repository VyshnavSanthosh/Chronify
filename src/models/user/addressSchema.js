import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
        },

        name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
        },

        phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, "Invalid Indian phone number"]
        },

        address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
        },

        district: {
        type: String,
        required: true,
        trim: true
        },

        state: {
        type: String,
        required: true,
        trim: true
        },

        landmark: {
        type: String,
        trim: true,
        default: ""
        },

        pinCode: {
        type: String,
        required: true,
        match: [/^\d{6}$/, "Invalid PIN code"]
        },

        addressType: {
        type: String,
        enum: ["home", "work"],
        default: "home"
        },

        isDefault: {
        type: Boolean,
        default: false,
        index: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Address", addressSchema);
