import Order from "../../models/user/orderSchema.js";
import mongoose from "mongoose";

export default class OrderRepository {
    async saveOrderInDb(data, userId) {
        try {
            const orderItems = data.items.map(item => ({
                productId: new mongoose.Types.ObjectId(item.productId),
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                sku: item.sku,
                mainImage: item.mainImage,
                offer: item.offer
            }));

            console.log("items : ", data.items)


            const order = new Order({
                user: new mongoose.Types.ObjectId(userId),

                address: {
                    user: new mongoose.Types.ObjectId(userId),
                    name: data.address.name,
                    phone: data.address.phone,
                    address: data.address.address,
                    district: data.address.district,
                    state: data.address.state,
                    pinCode: data.address.pinCode,
                    landmark: data.address.landmark,
                    addressType: data.address.addressType
                },

                items: orderItems,
                total: Number(data.total),

                discountAmount: Number(data.discountAmount || 0),
                couponCode: data.couponCode || null,
                paymentMethod: data.paymentMethod,
                statusHistory: [{ status: "pending", timestamp: new Date() }]
            });

            const savedOrder = await order.save();
            return savedOrder;

        } catch (error) {
            console.log("Couldn't store order in db", error);
            throw error;
        }
    }

    async getAllOrdersByUserId(userId, skip = 0, limit = 10) {
        try {
            const orders = await Order.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalOrders = await Order.countDocuments({ user: userId });

            return { orders, totalOrders };
        } catch (error) {
            console.log("Couldn't get the orders for this user", error)
        }
    }

    async getOrderDetailById(orderId) {
        try {
            const order = await Order.findById(orderId)
            return order

        } catch (error) {
            throw new Error("Couldn't get the order detail ", error.message);

        }
    }

    async getOrderDetailByIdwithVendorId(orderId) {
        try {
            const order = await Order.findById(orderId).populate("items.productId", "vendorId").lean()
            return order

        } catch (error) {
            throw new Error("Couldn't get the order detail ", error.message);

        }
    }
    async getAllOrders(skip = 0, limit = 10, status = null) {
        try {
            const query = status ? { orderStatus: status } : {};
            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'firstName email');
            const totalOrders = await Order.countDocuments(query);
            return { orders, totalOrders };
        } catch (error) {
            console.log("Couldn't fetch all orders", error);
            throw error;
        }
    }

    async getOrdersByProductIds(productIds, skip = 0, limit = 10, status = null) {
        try {
            const query = {
                'items.productId': { $in: productIds }
            };
            if (status) query.orderStatus = status;

            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalOrders = await Order.countDocuments(query);

            return { orders, totalOrders };
        } catch (error) {
            console.log("Couldn't fetch vendor orders", error);
            throw error;
        }
    }

    async updateOrderStatusById(orderId, status) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new Error("Order not found");
            }

            const statusHierarchy = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
            const currentStatusIndex = statusHierarchy.indexOf(order.orderStatus);
            const newStatusIndex = statusHierarchy.indexOf(status);

            if (order.orderStatus === 'cancelled') {
                throw new Error(`Cannot update status of a cancelled order`);
            }
            if (order.orderStatus === 'delivered' && !['return_requested', 'returned'].includes(status)) {
                throw new Error(`Cannot update status of a delivered order`);
            }

            if (status === 'cancelled') {
                if (currentStatusIndex >= 3) {
                    throw new Error("Cannot cancel an order that has already been shipped");
                }
            }
            const updateData = {
                $set: { orderStatus: status },
                $push: { statusHistory: { status, timestamp: new Date() } }
            };
            if (status === "delivered") {
                updateData.$set.paymentStatus = "completed";
            }
            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                updateData,
                { new: true }
            );
            return updatedOrder;
        } catch (error) {
            console.log("Couldn't update order status", error);
            throw error;
        }
    }

    async updatePaymentStatus(orderId, paymentStatus) {
        try {
            return await Order.findByIdAndUpdate(orderId, {
                $set: { paymentStatus: paymentStatus },
            }, { new: true })

        } catch (error) {
            console.log("Couldn't update payment status :", error)

            throw new Error("Couldn't update payment status ");

        }
    }

    async updateOrderItemStatus(orderId, sku, status) {
        try {
            const updatedOrder = await Order.findOneAndUpdate(
                { _id: orderId, "items.sku": sku },
                { $set: { "items.$.status": status } },
                { new: true }
            );
            return updatedOrder;
        } catch (error) {
            console.log("Couldn't update item status", error);
            throw error;
        }
    }
}
