import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user/userSchema.js';
import Order from './src/models/user/orderSchema.js';

dotenv.config();

const MONGO_URI = process.env.DB_URI || 'mongodb://localhost:27017/chronify';

async function verifyCounts() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const totalUsers = await User.countDocuments();
        const customers = await User.countDocuments({ role: 'customer' });
        const vendors = await User.countDocuments({ role: 'vendor' });

        const allOrders = await Order.countDocuments();
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
        const returnRejectedOrders = await Order.countDocuments({ orderStatus: 'return_rejected' });

        const pendingStatuses = ["pending", "confirmed", "packed", "shipped", "out_for_delivery"];
        const pendingOrders = await Order.countDocuments({ orderStatus: { $in: pendingStatuses } });

        const totalSalesSum = await Order.aggregate([
            { $match: { paymentStatus: 'completed', orderStatus: { $nin: ['cancelled', 'return_rejected'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        console.log('--- Database Counts ---');
        console.log('Total Users:', totalUsers);
        console.log('Customers:', customers);
        console.log('Vendors:', vendors);
        console.log('Total Orders (all):', allOrders);
        console.log('Cancelled Orders:', cancelledOrders);
        console.log('Return Rejected Orders:', returnRejectedOrders);
        console.log('Orders Count (excl. cancelled/rejected):', allOrders - cancelledOrders - returnRejectedOrders);
        console.log('Pending Orders (count):', pendingOrders);
        console.log('Admin Total Sales (completed & not cancelled):', totalSalesSum[0]?.total || 0);

        // Vendor check (aggregate all vendors)
        const vendorSales = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.status': { $nin: ['cancelled', 'returned'] }, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
        ]);
        console.log('Sum of all Vendor Sales (item level):', vendorSales[0]?.total || 0);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyCounts();
