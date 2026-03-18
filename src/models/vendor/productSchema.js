import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    }
}, { _id: false });

const variantSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true
    },
    color: {
        type: String,
        required: true
    },
    strapMaterial: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    offer: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    mainImage: {
        type: imageSchema,
        required: true
    },
    additionalImages: [imageSchema]
}, { _id: true });

const specificationSchema = new mongoose.Schema({
    weight: {
        type: String,
        required: true
    },
    waterResistance: {
        type: String,
        required: true
    },
    warranty: {
        type: String,
        required: true
    }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    variants: {
        type: [variantSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Product must have at least one variant'
        }
    },
    specifications: {
        type: specificationSchema,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isListed: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

productSchema.index({ vendorId: 1, status: 1 });
productSchema.index({ name: 'text', brand: 'text' });

export default mongoose.model("Product", productSchema);