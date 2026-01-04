// models/VendorDocument.js
const mongoose = require('mongoose');

const vendorDocumentSchema = new mongoose.Schema(
    {
        vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true
        },
        documentType: {
        type: String,
        enum: ['gstDocument', 'panCard', 'tradeLicense'],
        required: true
        },
        cloudinaryUrl: {
        type: String,
        required: true
        },
        publicId: {
        type: String,
        required: true,
        unique: true
        },
        filename: {
        type: String,
        required: true
        },
        size: {
        type: Number, // in bytes
        required: true
        },
        status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
        index: true
        },
        uploadedAt: {
        type: Date,
        default: Date.now,
        index: true
        },
        verifiedAt: {
        type: Date,
        default: null
        },
        verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
        },
        rejectionReason: {
        type: String,
        default: null
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

// Compound index for vendor and document type (unique per vendor)
vendorDocumentSchema.index({ vendorId: 1, documentType: 1 });

module.exports = mongoose.model('VendorDocument', vendorDocumentSchema);