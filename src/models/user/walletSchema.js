import mongoose from "mongoose";
const walletSchema = new mongoose.Schema(
    {
        transactionId: {
        type: String,
        unique: true
        },

        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
        },

        amount: {
        type: Number,
        required: true,
        min: 0
        },

        type: {
        type: String,
        enum: ["credit", "debit"],
        required: true
        },

        description: {
        type: String,
        trim: true
        },

        source: {
        type: String,
        enum: ["return_refund", "order_payment", "wallet_topup", "order_cancel_refund", "referal_bonus"],
        required: true
        }
    },
    {
        timestamps: true // automatically adds createdAt & updatedAt
    }
);

export default mongoose.model("Wallet", walletSchema);
