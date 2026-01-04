const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        description: {
            type: String,
            required: true
        },
        
        isListed: {
            type: Boolean,
            default: true
        },

        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            required: true,
            default: "percentage"
        },

        discountValue: {
            type: Number,
            required: true
        },

        maxRedeemable: {
            type: Number,
            default: null
        }

    },
    { timestamps: true }
)

module.exports = mongoose.model("Category", CategorySchema)