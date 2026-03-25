import crypto from "crypto"
export default class OrderService {
    constructor(orderRepository, addressRepository, cartRepository, returnRepository, productInventoryService, emailQueue, productRepository, categoryRepository, couponRepository, walletRepository, vendorRepository) {
        this.orderRepository = orderRepository
        this.addressRepository = addressRepository
        this.cartRepository = cartRepository
        this.returnRepository = returnRepository
        this.productInventoryService = productInventoryService
        this.emailQueue = emailQueue
        this.productRepository = productRepository
        this.categoryRepository = categoryRepository
        this.couponRepository = couponRepository
        this.walletRepository = walletRepository
        this.vendorRepository = vendorRepository
    }
    async getAllAddress(userId) {
        const address = await this.addressRepository.getAllAddressByUserId(userId)
        return address
    }

    async getCartItems(userId, selectedSkus = null, couponDiscount, couponApplyType, maxDiscountAmount) {
        const { cart, count } = await this.cartRepository.getAllItemsByUserId(userId)
        let total = 0
        const filteredItems = [];

        let removedItemsCount = 0;
        for (let item = 0; item < cart.items.length; item++) {
            if (selectedSkus && !selectedSkus.includes(cart.items[item].sku)) {
                continue;
            }
            let productObj = {}
            let product = await this.cartRepository.getProductBySku(cart.items[item].sku)

            const category = await this.categoryRepository.findById(product.category)

            // Check if product, category or vendor is blocked
            if (!product || !product.isListed || product.isDeleted || (category && !category.isListed) || (product.vendorId && (await this.vendorRepository.findById(product.vendorId))?.isBlocked)) {
                removedItemsCount++;
                continue;
            }

            productObj.name = product.name
            productObj.productId = product._id
            for (const variant of product.variants) {
                if (variant.sku == cart.items[item].sku) {
                    productObj.price = variant.price
                    productObj.offer = variant.offer
                    productObj.mainImage = variant.mainImage.url
                }
            }

            cart.items[item].product = productObj

            let totalPricePerProduct = (cart.items[item].qty * productObj.price) - (((cart.items[item].qty * productObj.price) * productObj.offer) / 100)

            if (category && category.discountType == "percentage" && category.discountValue > productObj.offer) {
                productObj.offer = category.discountValue
                console.log("Category discount % applied")

                totalPricePerProduct = (cart.items[item].qty * productObj.price) - (((cart.items[item].qty * productObj.price) * productObj.offer) / 100)
            }
            else if (category && category.discountType == "flat") {
                const categoryMaxDiscount = (productObj.price * category.maxRedeemable) / 100
                const categoryDiscount = Math.min(category.discountValue, categoryMaxDiscount)
                if (categoryDiscount > ((price * productObj.offer) / 100)) {
                    productObj.offer = categoryDiscount
                }
            }

            total += totalPricePerProduct
            filteredItems.push(cart.items[item]);
        }

        const subTotal = total;
        let discountAmount = 0;

        if (couponApplyType == "all" && couponDiscount) {
            let potentialDiscount = (total * couponDiscount) / 100;

            if (maxDiscountAmount && potentialDiscount > Number(maxDiscountAmount)) {
                potentialDiscount = Number(maxDiscountAmount);
            }

            discountAmount = potentialDiscount;
            total = total - discountAmount;
        }

        cart.items = filteredItems;

        const shippingFee = 40

        return { cart, total, subTotal, discountAmount, shippingFee, removedItemsCount }
    }

    async saveOrder(data, userId, userEmail) {
        try {
            const products = []
            for (const item of data.items) {
                const productObj = {
                    id: item.productId,
                    sku: item.sku,
                    qty: item.quantity
                }
                products.push(productObj)
            }
            const savedOrder = await this.orderRepository.saveOrderInDb(data, userId)
            if (savedOrder) {
                if (data.couponCode) {
                    await this.couponRepository.incrementUsedCount(data.couponCode);
                }
                const skus = data.items.map(item => item.sku);
                await this.cartRepository.removeItemsFromCart(userId, skus);

                await this.emailQueue.add("order-confirmation", {
                    email: userEmail,
                    orderId: savedOrder._id || savedOrder.orderId,
                    total: savedOrder.total
                });
            }
            return savedOrder

        } catch (error) {
            console.log("Couldn't save order : ", error)
            throw error.message
        }
    }

    async getAllOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const { orders, totalOrders } = await this.orderRepository.getAllOrdersByUserId(userId, skip, limit);

        const totalPages = Math.ceil(totalOrders / limit);

        return {
            orders,
            totalOrders,
            totalPages,
            currentPage: page
        };
    }

    async getOrderDetail(orderId) {
        return await this.orderRepository.getOrderDetailById(orderId)
    }

    async cancelOrder(orderId, userId) {
        const order = await this.orderRepository.getOrderDetailById(orderId);
        if (order.orderStatus == "cancelled") {
            throw new Error("The order is already cancelled");
        }


        let refundableAmount = 0;
        let itemsToRelease = [];

        const totalPreCoupon = order.total + (order.discountAmount || 0) - (order.shippingFee || 40);

        for (const item of order.items) {
            const itemStatus = item.status || 'pending';
            if (itemStatus !== 'cancelled' && itemStatus !== 'returned' && itemStatus !== 'refunded') {
                const itemDiscountedPricePreCoupon = (item.price * item.quantity) - (((item.price * item.quantity) * (item.offer || 0)) / 100);

                let itemShareOfCoupon = 0;
                if (order.discountAmount > 0 && totalPreCoupon > 0) {
                    itemShareOfCoupon = (itemDiscountedPricePreCoupon / totalPreCoupon) * order.discountAmount;
                }

                refundableAmount += (itemDiscountedPricePreCoupon - itemShareOfCoupon);

                itemsToRelease.push({
                    id: item.productId,
                    sku: item.sku,
                    qty: item.quantity
                });
            }
        }

        if (refundableAmount > 0 && order.paymentMethod != "COD") {
            const transactionId = "TXN" + crypto.randomBytes(8).toString("hex").toUpperCase();
            await this.walletRepository.addMoney(refundableAmount, transactionId, userId, "credit", "order_cancel_refund");
        }


        const result = await this.orderRepository.updateOrderStatusById(orderId, "cancelled");

        for (const item of order.items) {
            if (item.status !== 'cancelled' && item.status !== 'returned' && item.status !== 'refunded') {
                await this.orderRepository.updateOrderItemStatus(orderId, item.sku, "cancelled");
            }
        }

        if (itemsToRelease.length > 0) {
            await this.productInventoryService.releaseStock(itemsToRelease);
        }

        return result;
    }

    async cancelOrderItem(orderId, sku, userId) {
        const order = await this.orderRepository.getOrderDetailById(orderId);
        let item = order.items.find(i => i.sku === sku);

        if (!item) throw new Error("Item not found in order");
        if (item.status === "cancelled") throw new Error("The product is already cancelled");
        if (order.orderStatus === "cancelled") throw new Error("The order is already cancelled");

        if (order.paymentMethod != "COD") {
            const transactionId = "TXN" + crypto.randomBytes(8).toString("hex").toUpperCase();
            const itemDiscountedPricePreCoupon = (item.price * item.quantity) - (((item.price * item.quantity) * (item.offer || 0)) / 100);
            const totalPreCoupon = order.total + (order.discountAmount || 0) - (order.shippingFee || 40);

            let itemShareOfCoupon = 0;
            if (order.discountAmount > 0 && totalPreCoupon > 0) {
                itemShareOfCoupon = (itemDiscountedPricePreCoupon / totalPreCoupon) * order.discountAmount;
            }

            const price = itemDiscountedPricePreCoupon - itemShareOfCoupon;
            await this.walletRepository.addMoney(price, transactionId, userId, "credit", "order_cancel_refund");
        }

        const result = await this.orderRepository.updateOrderItemStatus(orderId, sku, "cancelled");
        await this.productInventoryService.releaseStock([{
            id: item.productId,
            sku: item.sku,
            qty: item.quantity
        }]);

        await this.syncGlobalOrderStatus(orderId);

        return result;
    }


    async returnOrder(orderId, reason, userId) {
        const order = await this.orderRepository.getOrderDetailByIdwithVendorId(orderId);
        const vendorIds = [...new Set(order.items.map(i => i.productId.vendorId.toString()))];

        if (!order) throw new Error("Order not found");

        if (order.orderStatus == "returned") throw new Error("The order is already returned");
        if (order.orderStatus == "return_requested") throw new Error("Return already requested for this order");

        for (const vendorId of vendorIds) {
            let vendorItems = order.items.filter((item) => {
                return item.productId.vendorId.toString() === vendorId.toString()
            })

            // Filter active items for this vendor
            const activeVendorItems = vendorItems.filter(item =>
                !["returned", "cancelled", "refunded"].includes(item.status)
            );

            // Only create the return request if there are active items for this vendor
            if (activeVendorItems.length > 0) {
                const returnData = {
                    orderId: order._id,
                    userId: order.user,
                    vendorId: vendorId,
                    items: activeVendorItems.map(item => ({
                        productId: item.productId._id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        sku: item.sku,
                        mainImage: item.mainImage,
                        offer: item.offer,
                        status: "return_requested"
                    })),
                    reason: reason || "No reason provided",
                    refundAmount: activeVendorItems.reduce((total, item) => {
                        const itemTotal = item.price * item.quantity
                        const itemDiscountedPricePreCoupon = itemTotal - (itemTotal * (item.offer || 0) / 100)

                        const totalPreCoupon = order.total + (order.discountAmount || 0) - (order.shippingFee || 40);
                        let itemShareOfCoupon = 0;
                        if (order.discountAmount > 0 && totalPreCoupon > 0) {
                            itemShareOfCoupon = (itemDiscountedPricePreCoupon / totalPreCoupon) * order.discountAmount;
                        }

                        return total + (itemDiscountedPricePreCoupon - itemShareOfCoupon)
                    }, 0)
                }

                await this.returnRepository.createReturnRequest(returnData);
            }
        }


        const result = await this.orderRepository.updateOrderStatusById(orderId, "return_requested");


        for (const item of order.items) {
            if (item.status !== 'cancelled' && item.status !== 'returned' && item.status !== 'refunded') {
                await this.orderRepository.updateOrderItemStatus(orderId, item.sku, "return_requested");
            }
        }

        return result;
    }

    async returnOrderItem(orderId, sku, userId, reason) {
        const order = await this.orderRepository.getOrderDetailByIdwithVendorId(orderId);


        let item = order.items.find(i => i.sku === sku);

        let vendorId = item.productId.vendorId

        if (!item) throw new Error("Item not found in order");
        if (item.status === "cancelled") throw new Error("The product is already cancelled");
        if (order.orderStatus === "cancelled") throw new Error("The order is already cancelled");
        if (item.status === "returned") throw new Error("The product is already returned");
        if (order.orderStatus === "returned") throw new Error("The order is already returned");


        const itemPrice = (item.price * item.quantity) - (((item.price * item.quantity) * item.offer) / 100);
        const returnData = {
            orderId: order._id,
            userId: order.user,
            vendorId: vendorId,
            items: [{
                productId: item.productId._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                sku: item.sku,
                mainImage: item.mainImage,
                offer: item.offer,
                status: 'return_requested'
            }],
            reason: reason || "No reason provided",
            refundAmount: (() => {
                const itemDiscountedPricePreCoupon = (item.price * item.quantity) - (((item.price * item.quantity) * (item.offer || 0)) / 100);
                const totalPreCoupon = order.total + (order.discountAmount || 0) - (order.shippingFee || 40);

                let itemShareOfCoupon = 0;
                if (order.discountAmount > 0 && totalPreCoupon > 0) {
                    itemShareOfCoupon = (itemDiscountedPricePreCoupon / totalPreCoupon) * order.discountAmount;
                }

                return itemDiscountedPricePreCoupon - itemShareOfCoupon;
            })(),
        }

        await this.returnRepository.createReturnRequest(returnData);

        const result = await this.orderRepository.updateOrderItemStatus(orderId, sku, "return_requested");

        return result
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

    async sendProductDataToInventoryToReserve(products) {
        let productsArr = []
        for (const product of products) {
            let productObj = {
                id: product.productId,
                sku: product.sku,
                qty: product.quantity
            }
            productsArr.push(productObj)
        }
        return await this.productInventoryService.reserveStock(productsArr)
    }

    async updatePaymentStatus(orderId, paymentStatus) {
        return await this.orderRepository.updatePaymentStatus(orderId, paymentStatus)
    }

    async updateOrderStatus(orderId, status) {
        const order = await this.orderRepository.getOrderDetailById(orderId);
        if (order && order.items) {
            for (const item of order.items) {
                await this.orderRepository.updateOrderItemStatus(orderId, item.sku, status);
            }
        }
        return await this.syncGlobalOrderStatus(orderId);
    }
}

async function renderORder(req, res) {
    let { page } = req.query
    let limit = 10
    let skip = (1 - page) * limit

}