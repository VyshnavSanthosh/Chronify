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

    async getAllVendors(limit, skip, sortOrder, search, status,sortField){
        const query = {
            isApproved: true
        }
        if (status == "true") {
            query.isBlocked = true
        }
        else if (status == "false") {
            query.isBlocked = false
        }

        if (search) {
            query.brandName = { $regex: search, $options: "i" }
        }

        const sortObj = {};
        sortObj[sortField] = sortOrder;

        const vendors = await Vendor.find(query)
        .sort(sortObj) 
        .skip(skip)                     
        .limit(limit);
        
        const totalVendors = await Vendor.countDocuments(query);

        return {vendors, totalVendors};
    }

    async updateVendorBlockStatus(vendorId, isBlocked) {
        try {
            const updatedVendor = await Vendor.findByIdAndUpdate(
                vendorId,
                { isBlocked: isBlocked },
                { new: true }
            )

            if (!updatedVendor) {
                throw new Error("Vendor not found")
            }

            return updatedVendor
        } catch (error) {
            throw new Error(`Error updating vendor block status: ${error.message}`)
        }
    }
}