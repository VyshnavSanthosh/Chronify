import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: Number,
        sku: String,
        mainImage: String,
        offer: Number,
        status: {
            type: String,
            enum: ['return_requested', 'returned'],
            default: 'return_requested'
        }
    }],

    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    refundAmount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Return = mongoose.model('Return', returnSchema);
export default Return;
