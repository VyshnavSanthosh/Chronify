import mongoose from "mongoose";
const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        sku: {
            type: String,
            required: true
        },
        mainImage: {
            type: String,
            required: true
        },
        offer: {
            type: Number,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned", "refunded"],
            default: "pending"
        }
    },

    { _id: false }
)

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: String,
        phone: String,
        address: String,
        district: String,
        state: String,
        landmark: String,
        pinCode: String,
        addressType: {
            type: String,
            enum: ["home", "work", "other"]
        }
    },
    { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true
        },


        address: {
            type: addressSchema,
            required: true
        },

        total: {
            type: Number,
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ["razorpay", "COD", "wallet"],
            required: true
        },

        transactionId: {
            type: String,
            default: null
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "packed",
                "shipped",
                "out_for_delivery",
                "delivered",
                "cancelled",
                "returned",
                "refunded",
                "return_requested",
                "return_rejected"
            ],
            default: "pending"
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending"
        },
        statusHistory: [
            {
                status: {
                    type: String,
                    required: true
                },
                timestamp: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        discountAmount: {
            type: Number,
            default: 0
        },
        couponCode: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Order", orderSchema)
