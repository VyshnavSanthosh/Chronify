export default class AdminOrderService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async getAllOrders(page = 1, limit = 10, status = null) {
        const skip = (page - 1) * limit;
        const { orders, totalOrders } = await this.orderRepository.getAllOrders(skip, limit, status);
        const totalPages = Math.ceil(totalOrders / limit);

        return {
            orders,
            totalOrders,
            totalPages,
            currentPage: page
        };
    }
}
