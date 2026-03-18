export default class AdminOrderController {
    constructor(adminOrderService, orderService) {
        this.adminOrderService = adminOrderService;
        this.orderService = orderService
    }

    async renderOrderListPage(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status || null;
            const { orders, totalOrders, totalPages, currentPage } = await this.adminOrderService.getAllOrders(page, limit, status);

            res.render("admin/order/orderList", {
                user: req.user,
                orders: orders,
                totalOrders,
                totalPages,
                currentPage,
                status,
                activePage: "orders"
            });
        } catch (error) {
            console.log("Error rendering admin order list:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    async renderOrderDetailPage(req, res) {
        const { orderId } = req.params
        const user = req.user

        try {
            const order = await this.orderService.getOrderDetail(orderId)
            console.log("order : ", order)

            return res.render("user/order/orderDetail", {
                order,
                user
            })
        } catch (error) {
            console.log("Couldn't render order detail page", error)
        }
    }
}
