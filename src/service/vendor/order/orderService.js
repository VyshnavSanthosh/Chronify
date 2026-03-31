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
        return await this.orderRepository.getOrderDetailByIdwithVendorId(orderId)
    }

    async updateOrderStatus(orderId, status, vendorId) {
        const order = await this.orderRepository.getOrderDetailByIdwithVendorId(orderId);
        const vendorItems = order.items.filter(item =>
            item.productId && item.productId.vendorId && item.productId.vendorId.toString() === vendorId.toString()
        );

        for (const item of vendorItems) {
            if (['cancelled', 'returned', 'refunded'].includes(item.status)) continue;
            await this.orderRepository.updateOrderItemStatus(orderId, item.sku, status);
        }

        return await this.syncGlobalOrderStatus(orderId);
    }

    async updateItemStatus(orderId, sku, status) {
        const order = await this.orderRepository.getOrderDetailById(orderId);
        const item = order.items.find(i => i.sku === sku);

        if (item && ['cancelled', 'returned', 'refunded'].includes(item.status)) {
            throw new Error(`Cannot update status of a ${item.status} item`);
        }

        const result = await this.orderRepository.updateOrderItemStatus(orderId, sku, status);
        await this.syncGlobalOrderStatus(orderId);
        return result;
    }

    async syncGlobalOrderStatus(orderId) {
        try {
            const order = await this.orderRepository.getOrderDetailById(orderId);
            if (!order) return;

            const activeItems = order.items.filter(item =>
                !['cancelled', 'returned', 'refunded'].includes(item.status)
            );

            if (activeItems.length === 0) {
                const hasReturned = order.items.some(item => ['returned', 'refunded'].includes(item.status));
                let finalStatus = 'cancelled';
                if (hasReturned) finalStatus = 'returned';

                if (order.orderStatus !== finalStatus) {
                    await this.orderRepository.updateOrderStatusById(orderId, finalStatus);
                }
                return;
            }

            const statusHierarchy = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
            let minStatusIndex = statusHierarchy.length - 1;

            for (const item of activeItems) {
                const itemStatusIndex = statusHierarchy.indexOf(item.status);
                if (itemStatusIndex !== -1 && itemStatusIndex < minStatusIndex) {
                    minStatusIndex = itemStatusIndex;
                }
            }

            const newGlobalStatus = statusHierarchy[minStatusIndex];
            if (order.orderStatus !== newGlobalStatus) {
                await this.orderRepository.updateOrderStatusById(orderId, newGlobalStatus);
            }
        } catch (error) {
            console.log("Error syncing global order status:", error);
        }
    }
}
