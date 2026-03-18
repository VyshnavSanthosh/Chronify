import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DashboardRepository from './src/repository/admin/dashboardRepository.js';
import VendorDashboardRepository from './src/repository/vendor/vendorDashboardRepository.js';

dotenv.config();

const MONGO_URI = process.env.DB_URI || 'mongodb://localhost:27017/chronify';

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const adminRepo = new DashboardRepository();
        const vendorRepo = new VendorDashboardRepository();

        console.log('--- Admin Summary Stats ---');
        const adminStats = await adminRepo.getSummaryStats();
        console.log(adminStats);

        // For vendor, we'll pick the first vendor from the list to test
        const collections = await mongoose.connection.db.listCollections().toArray();
        if (collections.some(c => c.name === 'vendors')) {
            const vendor = await mongoose.connection.db.collection('vendors').findOne();
            if (vendor) {
                console.log(`--- Vendor Summary Stats (Vendor: ${vendor.brandName}) ---`);
                const vendorStats = await vendorRepo.getSummaryStats(vendor._id.toString());
                console.log(vendorStats);
            }
        }

        // Check sum of all vendor sales vs admin sales
        const allVendors = await mongoose.connection.db.collection('vendors').find().toArray();
        let totalVendorSales = 0;
        for (const v of allVendors) {
            const vStats = await vendorRepo.getSummaryStats(v._id.toString());
            totalVendorSales += vStats.totalSales;
        }
        console.log('Total Sum of all Vendor Sales:', totalVendorSales);
        console.log('Admin Total Sales:', adminStats.totalSales);
        console.log('Difference:', adminStats.totalSales - totalVendorSales);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

verify();
