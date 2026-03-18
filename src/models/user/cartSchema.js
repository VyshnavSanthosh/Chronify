import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartItemSchema = new Schema(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        
        sku: {
            type: String,
            required: true,
            trim: true
        },

        qty: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },

        addedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
    );

    const cartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One cart per user
            index: true
        },

        items: [cartItemSchema],

    },
    {
        timestamps: { createdAt: false, updatedAt: true }
    }
);

export default model("Cart", cartSchema);
