import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {

        // ---------- Coupon Code ----------
        couponCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            minlength: 3,
            maxlength: 20
        },

        // ---------- Discount % ----------
        discount: {
            type: Number,
            required: true,
            min: 1,
            max: 90
        },

        // ---------- Description ----------
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 200
        },

        // ---------- Usage Limit ----------
        usageLimit: {
            type: Number,
            required: true,
            min: 1
        },

        // ---------- Used Count (Tracking) ----------
        usedCount: {
            type: Number,
            default: 0
        },

        // ---------- Starting Date ----------
        startDate: {
            type: Date,
            required: true
        },

        // ---------- Expiry Date ----------
        expiryDate: {
            type: Date,
            required: true
        },

        // ---------- Apply Type ----------
        applyType: {
            type: String,
            default: "all",
            required: true
        },

        // ---------- Max Discount Amount ----------
        maxDiscountAmount: {
            type: Number,
            required: true,
            min: 1
        },

        // ---------- Minimum Purchase ----------
        minimumPurchase: {
            type: Number,
            required: true,
            min: 0
        },

        // ---------- Category ----------
        category: {
            type: String,
            trim: true,
            default: null
        },

        // ---------- Status ----------
        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true
    }
);

export default mongoose.model("Coupon", couponSchema);
