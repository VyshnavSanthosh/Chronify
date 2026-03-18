export default class OrderListControler {
    constructor(orderService) {
        this.orderService = orderService
    }
    async renderOrderListPage(req, res) {
        try {
            const userId = req.user._id
            const page = parseInt(req.query.page) || 1;
            const limit = 10;

            const { orders, totalPages, currentPage } = await this.orderService.getAllOrders(userId, page, limit)

            return res.render("user/order/orderLIst", {
                user: req.user,
                orders,
                currentPage,
                totalPages
            })
        } catch (error) {
            console.log("Couldn't render order list page", error)
        }
    }

    async renderOrderDetailPage(req, res) {
        const { orderId } = req.params
        const user = req.user

        try {
            const order = await this.orderService.getOrderDetail(orderId)
            console.log("Order : ", order)

            return res.render("user/order/orderDetail", {
                order,
                user
            })
        } catch (error) {
            console.log("Couldn't render order detail page", error)
        }
    }

    async downloadInvoice(req, res) {
        const { orderId } = req.params;
        const user = req.user;

        try {
            const order = await this.orderService.getOrderDetail(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" });
            }

            const { generateInvoice } = await import("../../../utils/invoiceGenerator.js");
            const pdfBuffer = await generateInvoice(order, user);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
            return res.send(pdfBuffer);

        } catch (error) {
            console.log("Error generating invoice:", error);
            res.status(500).json({ success: false, message: "Failed to generate invoice" });
        }
    }

    async cancelOrder(req, res) {
        try {
            const userId = req.user._id
            const { orderId } = req.params
            await this.orderService.cancelOrder(orderId, userId)
            return res.json({ success: true, message: "Order cancelled successfully" });
        } catch (error) {
            console.error("Error cancelling order:", error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async cancelOrderItem(req, res) {
        try {
            const userId = req.user._id;
            const { orderId, sku } = req.params;
            await this.orderService.cancelOrderItem(orderId, sku, userId);
            return res.json({ success: true, message: "Item cancelled successfully" });
        } catch (error) {
            console.error("Error cancelling order item:", error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async returnOrder(req, res) {
        try {
            const userId = req.user._id
            const { orderId } = req.params;
            const { reason } = req.body;
            await this.orderService.returnOrder(orderId, reason, userId);
            return res.json({ success: true, message: "Return request submitted successfully" });
        } catch (error) {
            console.error("Error submitting return request:", error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async returnOrderItem(req, res) {
        try {
            const userId = req.user._id;
            const { orderId, sku } = req.params;
            const { reason } = req.body;
            
            await this.orderService.returnOrderItem(orderId, sku, userId, reason);
            return res.json({ success: true, message: "Item return request submitted successfully" });
        } catch (error) {
            console.error("Error returning order item:", error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}