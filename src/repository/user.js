const User = require('../models/user/userSchema');

module.exports = class UserRepository{

    async findByEmail(email) {
        return await User.findOne({email})
    }

    async findByReferralCode(code) {
        return await User.findOne({ referralCode: code})
    }

    async getAllCustomers(limit, skip, sortOrder, search, status){
        const query = {
            role: { $ne: "admin" }
        }
        if (status == "true") {
            query.isBlocked = true
        }
        else if (status == "false") {
            query.isBlocked = false
        }
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } }
            ]
        }
        const customers = await User.find(query)
        .sort({ firstName: sortOrder }) 
        .skip(skip)                     
        .limit(limit);
        
        const totalCustomers = await User.countDocuments(query);

        return {customers, totalCustomers};
    }

    async createUser(userData) {
        try {
            const user = new User(userData);
            return await user.save();

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

    async setVerified(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { isVerified: true },
            { new: true }
        );
    }

    async findById(userId) { // JWT purpose
        return await User.findById(userId).select('-passwordHash -refreshToken');
    }

    async findByGoogleId(googleId) {
        return await User.findOne({ googleId });
    }

    async updateRefreshToken(userId, refreshToken) {
        return await User.findByIdAndUpdate(
            userId,
            { refreshToken },
            { new: true }
        );
    }

    async clearRefreshToken(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { refreshToken: null },
            { new: true }
        );
    }

    async createGoogleUser(userData) {
        try {
            const user = new User({
                ...userData,
                authProvider: 'google',
                isVerified: true // Google users are pre-verified
            });
            return await user.save();

        } catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0];
                throw new Error(`${field} already exists`);
            }
            throw error;
        }
    }

    async deleteById(userId) {
        return await User.findByIdAndDelete(userId);
    }

    async updateCustomerBlockStatus(customerId, isBlocked) {
    try {
        const updatedCustomer = await User.findByIdAndUpdate(
            customerId,
            { isBlocked: isBlocked },
            { new: true } // Returns the updated document
        )

        if (!updatedCustomer) {
            throw new Error("Customer not found")
        }

        return updatedCustomer
    } catch (error) {
        throw new Error(`Error updating customer block status: ${error.message}`)
    }
}

}


