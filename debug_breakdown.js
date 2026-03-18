import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/user/orderSchema.js';

dotenv.config();

const MONGO_URI = process.env.DB_URI || 'mongodb://localhost:27017/chronify';

async function breakdown() {
    try {
        await mongoose.connect(MONGO_URI);

        const statusBreakdown = await Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
        ]);
        console.log('Order Status Breakdown:');
        console.log(statusBreakdown);

        const pendingStatuses = ["pending", "confirmed", "packed", "shipped", "out_for_delivery"];
        const pOrders = await Order.find({ orderStatus: { $in: pendingStatuses } }, { orderStatus: 1, _id: 1 });
        console.log(`Total Pending Orders (${pendingStatuses.join(',')}):`, pOrders.length);

        const returnRequested = await Order.countDocuments({ orderStatus: 'return_requested' });
        console.log('Return Requested Orders:', returnRequested);

        // Sales check
        const salesSample = await Order.find({ paymentStatus: 'completed', orderStatus: { $nin: ['cancelled', 'return_rejected'] } }).limit(5);
        console.log('--- Sales Sample ---');
        salesSample.forEach(o => {
            const itemSum = o.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            console.log(`Order ID: ${o._id}, Total: ${o.total}, Discount: ${o.discountAmount}, Item Sum: ${itemSum}, Diff: ${o.total - (itemSum - o.discountAmount)}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

breakdown();
