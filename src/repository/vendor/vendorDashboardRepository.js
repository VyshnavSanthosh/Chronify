import Order from "../../models/user/orderSchema.js";
import User from "../../models/user/userSchema.js";
import Product from "../../models/vendor/productSchema.js";
import mongoose from "mongoose";

export default class VendorDashboardRepository {
    async getSummaryStats(vendorId) {
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

        const stats = await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $match: {
                    "productInfo.vendorId": vendorObjectId,
                    "orderStatus": { $nin: ["cancelled", "returned", "return_rejected"] }
                }
            },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalSales: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$paymentStatus", "completed"] },
                                                    { $not: { $in: ["$items.status", ["cancelled", "returned"]] } }
                                                ]
                                            },
                                            { $multiply: ["$items.price", "$items.quantity"] },
                                            0
                                        ]
                                    }
                                },
                                pendingOrders: { $addToSet: { $cond: [{ $in: ["$items.status", ["pending", "confirmed", "shipped", "out_for_delivery"]] }, "$_id", null] } },
                                distinctOrders: { $addToSet: "$_id" },
                                distinctUsers: { $addToSet: "$user" }
                            }
                        },
                        {
                            $project: {
                                totalSales: 1,
                                totalPending: { $size: { $filter: { input: "$pendingOrders", as: "id", cond: { $ne: ["$$id", null] } } } },
                                totalOrders: { $size: "$distinctOrders" },
                                totalCustomers: { $size: "$distinctUsers" }
                            }
                        }
                    ]
                }
            }
        ]);

        const result = stats[0]?.summary[0] || { totalCustomers: 0, totalOrders: 0, totalSales: 0, totalPending: 0 };

        return result;
    }

    async getSalesActivity(vendorId, period = 'monthly') {
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        const now = new Date();
        let startDate;
        let groupFormat;

        switch (period) {
            case 'weekly':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), 0, 1);
                groupFormat = { $month: "$createdAt" };
                break;
            case 'yearly':
                startDate = new Date(0);
                groupFormat = { $year: "$createdAt" };
                break;
            default:
                startDate = new Date(now.getFullYear(), 0, 1);
                groupFormat = { $month: "$createdAt" };
                break;
        }

        return await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $match: {
                    "productInfo.vendorId": vendorObjectId,
                    "items.status": { $nin: ["cancelled", "returned"] },
                    "paymentStatus": "completed",
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupFormat,
                    sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);
    }

    async getTopSellingProducts(vendorId, limit = 10) {
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        return await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $match: {
                    "productInfo.vendorId": vendorObjectId,
                    "items.status": { $nin: ["cancelled", "returned"] }
                }
            },
            {
                $group: {
                    _id: "$items.productId",
                    productName: { $first: "$items.name" },
                    unitsSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productInfo.category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            // Note: Since we need category from productInfo which was lost in group, 
            // we should have included it in $group or do another lookup.
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "pInfo"
                }
            },
            { $unwind: "$pInfo" },
            {
                $lookup: {
                    from: "categories",
                    localField: "pInfo.category",
                    foreignField: "_id",
                    as: "cInfo"
                }
            },
            { $unwind: "$cInfo" },
            {
                $project: {
                    name: "$productName",
                    category: "$cInfo.categoryName",
                    unitsSold: 1,
                    revenue: 1
                }
            },
            { $sort: { unitsSold: -1 } },
            { $limit: limit }
        ]);
    }

    async getTopSellingBrands(vendorId, limit = 10) {
        const vendorObjectId = new mongoose.Types.ObjectId(vendorId);
        return await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $match: {
                    "productInfo.vendorId": vendorObjectId,
                    "items.status": { $nin: ["cancelled", "returned"] }
                }
            },
            {
                $group: {
                    _id: "$productInfo.brand",
                    unitsSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            {
                $project: {
                    name: "$_id",
                    unitsSold: 1,
                    revenue: 1
                }
            },
            { $sort: { unitsSold: -1 } },
            { $limit: limit }
        ]);
    }
}
