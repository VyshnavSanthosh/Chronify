import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/user/orderSchema.js';
import User from './src/models/user/userSchema.js';

dotenv.config();

const MONGO_URI = process.env.DB_URI || 'mongodb://localhost:27017/chronify';

async function refinedBreakdown() {
    try {
        await mongoose.connect(MONGO_URI);

        const roles = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
        console.log('User Roles (User collection):', roles);

        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Collections:', collections.map(c => c.name));

            if (collections.some(c => c.name === 'vendors')) {
                const VendorCount = await mongoose.connection.db.collection('vendors').countDocuments();
                console.log('Vendors (vendors collection):', VendorCount);
            }
        } catch (e) {
            console.log('Error checking other collections:', e.message);
        }

        const pendingStatuses = ["pending", "confirmed", "packed", "shipped", "out_for_delivery"];
        const pendingWithPayment = await Order.aggregate([
            { $match: { orderStatus: { $in: pendingStatuses } } },
            { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
        ]);
        console.log('Pending Orders by Payment Status:', pendingWithPayment);

        const totalOrders = await Order.countDocuments();
        console.log('Total Orders:', totalOrders);

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

refinedBreakdown();
