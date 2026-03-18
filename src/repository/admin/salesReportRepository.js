import Order from "../../models/user/orderSchema.js";

export default class SalesReportRepository {
    async getSalesReport(startDate, endDate) {
        try {

            const aggregation = [
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        orderStatus: { $nin: ["cancelled", "returned"] },
                        paymentStatus: "completed"
                    }
                },
                {
                    $addFields: {
                        orderGross: {
                            $reduce: {
                                input: "$items",
                                initialValue: 0,
                                in: { $add: ["$$value", { $multiply: ["$$this.price", "$$this.quantity"] }] }
                            }
                        }
                    }
                },
                {
                    $project: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        orderId: "$_id",
                        paymentMethod: 1,
                        gross: "$orderGross",
                        discount: { $subtract: ["$orderGross", "$total"] },
                        net: "$total"
                    }
                },
                {
                    $sort: { date: -1 }
                }
            ];

            const report = await Order.aggregate(aggregation);
            return report;

        } catch (error) {
            console.log("Error in SalesReportRepository:", error);
            throw error;
        }
    }
}
