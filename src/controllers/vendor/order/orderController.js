export default class VendorOrderController {
    constructor(vendorOrderService, vendorReturnService) {
        this.vendorOrderService = vendorOrderService;
        this.vendorReturnService = vendorReturnService;
    }

    async renderOrderListPage(req, res) {
        try {
            const vendorId = req.user._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status || null;
            const { orders, totalOrders, totalPages, currentPage } = await this.vendorOrderService.getVendorOrders(vendorId, page, limit, status);

            res.render("vendor/order/orderList", {
                user: req.user,
                orders,
                totalOrders,
                totalPages,
                currentPage,
                status,
                activePage: 'orders'
            });

        } catch (error) {
            console.log("Error rendering vendor order list:", error);
            res.render("vendor/order/orderList", {
                user: req.user,
                orders: [],
                activePage: 'orders',
                error: "Failed to load orders. Please try again later."
            });
        }
    }

    async renderOrderDetailPage(req, res) {
        try {
            const vendor = req.user
            const { orderId } = req.params
            const order = await this.vendorOrderService.getOrder(orderId)
            return res.render("vendor/order/orderDetail", {
                order,
                user: vendor,
                activePage: 'orders'
            })
        } catch (error) {
            console.log("Couldn't load order detail page", error)
        }
    }

    async updateOrderStatus(req, res) {
        const { status } = req.body
        const { orderId } = req.params
        try {
            await this.vendorOrderService.updateOrderStatus(orderId, status)
            return res.status(200).json({
                success: true,
                message: "Order status updated successfully"
            })
        } catch (error) {
            console.log("Couldn't update status", error)
            return res.status(500).json({
                success: false,
                message: "Failed to update order status"
            })
        }
    }

    async renderReturnListPage(req, res) {
        try {
            const vendorId = req.user._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const { returns, totalReturns, totalPages, currentPage } = await this.vendorReturnService.getAllReturns(vendorId, page, limit);

            res.render("vendor/order/returnList", {
                user: req.user,
                returns: returns,
                totalReturns,
                totalPages,
                currentPage,
                activePage: 'returns'
            });
        } catch (error) {
            console.error("Error rendering return list:", error);
            res.render("vendor/order/returnList", {
                user: req.user,
                returns: [],
                activePage: 'returns'
            });
        }
    }

    async approveReturn(req, res) {
        try {
            const { returnId } = req.params;
            const result = await this.vendorReturnService.approveReturn(returnId);
            res.json(result);
        } catch (error) {
            console.error("Error approving return:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async rejectReturn(req, res) {
        try {
            const { returnId } = req.params;
            const { comment } = req.body;
            const result = await this.vendorReturnService.rejectReturn(returnId, comment);
            res.json(result);
        } catch (error) {
            console.error("Error rejecting return:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
