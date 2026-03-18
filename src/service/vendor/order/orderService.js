export default class VendorOrderService {
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    async getVendorOrders(vendorId, page = 1, limit = 10, status = null) {
        try {
            const skip = (page - 1) * limit;
            const productIdsobj = await this.productRepository.getProductIdsByVendor(vendorId);
            const productIds = productIdsobj.map((product) => {
                return product._id
            })

            if (productIds.length === 0) {
                return { orders: [], totalOrders: 0, totalPages: 0, currentPage: page };
            }

            const { orders, totalOrders } = await this.orderRepository.getOrdersByProductIds(productIds, skip, limit, status);

            const vendorOrders = orders.map(order => {
                const vendorItems = order.items.filter(item =>
                    productIds.some(pid => pid.toString() === item.productId.toString())
                );

                const vendorTotal = vendorItems.reduce((sum, item) => {
                    const offer = item.offer || 0;
                    const discountedPrice = item.price - (item.price * offer / 100);
                    return sum + (discountedPrice * item.quantity);
                }, 0);

                const orderObj = order.toObject();
                orderObj.items = vendorItems;
                orderObj.total = vendorTotal;
                return orderObj;
            });

            return {
                orders: vendorOrders,
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page
            };
        } catch (error) {
            console.log("Error getting vendor orders:", error);
            throw error;
        }
    }

    async getOrder(orderId) {
        return await this.orderRepository.getOrderDetailById(orderId)
    }

    async updateOrderStatus(orderId, status) {
        return await this.orderRepository.updateOrderStatusById(orderId, status)
        
    }
}
