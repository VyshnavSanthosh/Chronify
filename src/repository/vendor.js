const Vendor = require('../models/vendor/vendorSchema');

module.exports = class VendorRepository{
    
    async findByEmail(brandEmail){
        return await Vendor.findOne({brandEmail})
    } 

    async findById(vendorId) { // JWT purpose
        return await Vendor.findById(vendorId).select('-passwordHash -refreshToken');
    }

    async createVendor(newVendorData){
        try {
                const vendor = new Vendor(newVendorData);
                return await vendor.save();
        
            } catch (error) {
    
                // Duplicate key error (MongoDB error code 11000)
                if (error.code === 11000) {
                    const field = Object.keys(error.keyValue)[0];
                    throw new Error(`${field} already exists`);
                }
    
                // Re-throw other errors
                throw error;
            }
    }

    async setVerified(vendorId) {
        return await Vendor.findByIdAndUpdate(
            vendorId,
            { isVerified: true },
            { new: true }
        );
    }



    async updateRefreshToken(vendorId, refreshToken) {
            return await Vendor.findByIdAndUpdate(
                vendorId,
                { refreshToken },
                { new: true }
            );
        }
    
    async clearRefreshToken(vendorId) {
        return await Vendor.findByIdAndUpdate(
            vendorId,
            { refreshToken: null },
            { new: true }
        );
    }

    async deleteById(vendorId) {
        return await Vendor.findByIdAndDelete(vendorId);
    }

}