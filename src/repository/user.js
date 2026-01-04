const User = require('../models/user/userSchema');

module.exports = class UserRepository{

    async findByEmail(email) {
        return await User.findOne({email})
    }

    async findByReferralCode(code) {
        return await User.findOne({ referralCode: code})
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

}


