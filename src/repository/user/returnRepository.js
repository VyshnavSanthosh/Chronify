import Return from "../../models/user/returnSchema.js";
import mongoose from "mongoose";

export default class ReturnRepository {
    async createReturnRequest(data) {
        try {
            const returnRequest = new Return({
                orderId: new mongoose.Types.ObjectId(data.orderId),
                userId: new mongoose.Types.ObjectId(data.userId),
                vendorId: new mongoose.Types.ObjectId(data.vendorId),
                items: data.items,
                reason: data.reason,
                refundAmount: data.refundAmount,
                status: 'pending'
            });
            return await returnRequest.save();
        } catch (error) {
            console.error("Error creating return request in DB:", error);
            throw error;
        }
    }

    async getReturnsByVendorId(vendorId, skip = 0, limit = 10) {
        try {
            const query = { vendorId: new mongoose.Types.ObjectId(vendorId) };
            const returns = await Return.find(query)
                .populate('userId', 'firstName email')
                .populate('orderId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalReturns = await Return.countDocuments(query);
            return { returns, totalReturns };
        } catch (error) {
            console.error("Error fetching vendor returns from DB:", error);
            throw error;
        }
    }

    async getReturnById(returnId) {
        try {
            return await Return.findById(returnId)
                .populate('userId', 'firstName email')
                .populate('orderId');
        } catch (error) {
            console.error("Error fetching return detail from DB:", error);
            throw error;
        }
    }

    async updateReturnStatus(returnId, status, adminComment = "") {
        try {
            return await Return.findByIdAndUpdate(
                returnId,
                { status },
                { new: true }
            );
        } catch (error) {
            console.error("Error updating return status in DB:", error);
            throw error;
        }
    }

    async getReturnByOrderId(orderId) {
        try {
            return await Return.findOne({ orderId: new mongoose.Types.ObjectId(orderId) });
        } catch (error) {
            console.error("Error fetching return by orderId from DB:", error);
            throw error;
        }
    }
}
