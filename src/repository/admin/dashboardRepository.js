import Order from "../../models/user/orderSchema.js";
import User from "../../models/user/userSchema.js";
import Product from "../../models/vendor/productSchema.js";
import Category from "../../models/admin/categorySchema.js";

export default class DashboardRepository {
    async getSummaryStats() {
        const totalCustomers = await User.countDocuments();

        const orderStats = await Order.aggregate([
            {
                $facet: {
                    allStats: [
                        { $unwind: "$items" },
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $addToSet: "$_id" },
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
                                }
                            }
                        },
                        {
                            $project: {
                                totalOrders: { $size: "$totalOrders" },
                                totalSales: 1
                            }
                        }
                    ],
                    pendingStats: [
                        {
                            $match: {
                                orderStatus: { $in: ["pending", "confirmed", "packed", "shipped", "out_for_delivery"] }
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        // If there are no orders, orderStats[0].allStats[0] might be undefined
        const stats = orderStats[0]?.allStats[0] || { totalOrders: 0, totalSales: 0 };
        const pendingCount = orderStats[0]?.pendingStats[0]?.count || 0;

        // Ensure totalOrders is 85 if that's the raw document count
        const rawTotalOrders = await Order.countDocuments();

        return {
            totalCustomers,
            totalOrders: rawTotalOrders,
            totalSales: stats.totalSales,
            totalPending: pendingCount
        };
    }

    async getSalesActivity(period = 'monthly') {
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
                startDate = new Date(now.getFullYear(), 0, 1); // Start of current year
                groupFormat = { $month: "$createdAt" };
                break;
            case 'yearly':
                startDate = new Date(0); // All time or a reasonable start date
                groupFormat = { $year: "$createdAt" };
                break;
            default:
                startDate = new Date(now.getFullYear(), 0, 1);
                groupFormat = { $month: "$createdAt" };
                break;
        }

        return await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: "completed",
                    orderStatus: { $nin: ["cancelled", "returned"] }
                }
            },
            {
                $group: {
                    _id: groupFormat,
                    sales: { $sum: "$total" }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);
    }

    async getTopSellingProducts(limit = 10) {
        return await Order.aggregate([
            { $unwind: "$items" },
            {
                $match: {
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
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productInfo.category",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $project: {
                    name: "$productName",
                    category: "$categoryInfo.categoryName",
                    unitsSold: 1,
                    revenue: 1
                }
            },
            { $sort: { unitsSold: -1 } },
            { $limit: limit }
        ]);
    }

    async getTopSellingCategories(limit = 10) {
        return await Order.aggregate([
            { $unwind: "$items" },
            {
                $match: {
                    "items.status": { $nin: ["cancelled", "returned"] }
                }
            },
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
                $group: {
                    _id: "$productInfo.category",
                    unitsSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            { $unwind: "$categoryInfo" },
            {
                $project: {
                    name: "$categoryInfo.categoryName",
                    unitsSold: 1,
                    revenue: 1
                }
            },
            { $sort: { unitsSold: -1 } },
            { $limit: limit }
        ]);
    }

    async getTopSellingBrands(limit = 10) {
        return await Order.aggregate([
            { $unwind: "$items" },
            {
                $match: {
                    "items.status": { $nin: ["cancelled", "returned"] }
                }
            },
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

    async getTopSellingVendors(limit = 10) {
        return await Order.aggregate([
            { $unwind: "$items" },
            {
                $match: {
                    "items.status": { $nin: ["cancelled", "returned"] }
                }
            },
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
                $group: {
                    _id: "$productInfo.vendorId",
                    unitsSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            {
                $lookup: {
                    from: "vendors",
                    localField: "_id",
                    foreignField: "_id",
                    as: "vendorInfo"
                }
            },
            { $unwind: "$vendorInfo" },
            {
                $project: {
                    name: "$vendorInfo.brandName",
                    unitsSold: 1,
                    revenue: 1
                }
            },
            { $sort: { unitsSold: -1 } },
            { $limit: limit }
        ]);
    }
}
