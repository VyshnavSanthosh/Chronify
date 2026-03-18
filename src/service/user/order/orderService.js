import crypto from "crypto"
export default class OrderService {
    constructor(orderRepository, addressRepository, cartRepository, returnRepository, productInventoryService, emailQueue, productRepository, categoryRepository, couponRepository, walletRepository) {
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
    }
    async getAllAddress(userId) {
        const address = await this.addressRepository.getAllAddressByUserId(userId)
        return address
    }

    async getCartItems(userId, selectedSkus = null, couponDiscount, couponApplyType, maxDiscountAmount) {
        const { cart, count } = await this.cartRepository.getAllItemsByUserId(userId)
        let total = 0
        const filteredItems = [];
        console.log("cart :", cart)

        for (let item = 0; item < cart.items.length; item++) {
            if (selectedSkus && !selectedSkus.includes(cart.items[item].sku)) {
                continue;
            }
            let productObj = {}
            let product = await this.cartRepository.getProductBySku(cart.items[item].sku)


            const category = await this.categoryRepository.findById(product.category)

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

        return { cart, total, subTotal, discountAmount, shippingFee }
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
        console.log("orders", orders)

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

        for (const item of order.items) {
            const itemStatus = item.status || 'pending';
            if (itemStatus !== 'cancelled' && itemStatus !== 'returned' && itemStatus !== 'refunded') {
                const itemPrice = (item.price * item.quantity) - (((item.price * item.quantity) * item.offer) / 100);
                refundableAmount += itemPrice;

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
            const price = (item.price * item.quantity) - (((item.price * item.quantity) * item.offer) / 100);
            await this.walletRepository.addMoney(price, transactionId, userId, "credit", "order_cancel_refund");
        }

        const result = await this.orderRepository.updateOrderItemStatus(orderId, sku, "cancelled");
        await this.productInventoryService.releaseStock([{
            id: item.productId,
            sku: item.sku,
            qty: item.quantity
        }]);

        await this.checkAndUpdateOrderFinalStatus(orderId);

        return result;
    }


    async returnOrder(orderId, reason, userId) {
        const order = await this.orderRepository.getOrderDetailByIdwithVendorId(orderId);
        const vendorIds = [...new Set(order.items.map(i => i.productId.vendorId.toString()))];

        if (!order) throw new Error("Order not found");

        if (order.orderStatus == "returned") throw new Error("The order is already returned");
        if (order.orderStatus == "return_requested") throw new Error("Return already requested for this order");

        for (const vendorId of vendorIds) {
            console.log("id: ",vendorId)
            let vendorItems = order.items.filter((item)=>{
                return item.productId.vendorId == vendorId
            })
            const returnData = {
                orderId: order._id,
                userId: order.user,
                vendorId: vendorId,
                items: vendorItems.map(item => ({
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
                refundAmount: vendorItems.reduce((total, item) => {

                    if (["returned","cancelled","refunded"].includes(item.status)) {
                        return total
                    }

                    const itemTotal = item.price * item.quantity
                    const discounted = itemTotal - (itemTotal * item.offer / 100)

                    return total + discounted

                }, 0)
            }

            await this.returnRepository.createReturnRequest(returnData);
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
        console.log("Item : ", item)

        let vendorId = item.productId.vendorId
        console.log("vendorId : ", vendorId)

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
            refundAmount: itemPrice,
        }

        await this.returnRepository.createReturnRequest(returnData);

        const result = await this.orderRepository.updateOrderItemStatus(orderId, sku, "return_requested");

        return result
    }

    async checkAndUpdateOrderFinalStatus(orderId) {
        const order = await this.orderRepository.getOrderDetailById(orderId);
        if (!order) return;

        const allItemsFinished = order.items.every(item =>
            ['cancelled', 'returned', 'refunded', 'return_rejected'].includes(item.status)
        );

        if (allItemsFinished && order.items.length > 0) {
            const hasReturned = order.items.some(item => ['returned', 'refunded'].includes(item.status));
            const hasCancelled = order.items.some(item => item.status === 'cancelled');

            let finalStatus = 'cancelled';
            if (hasReturned) finalStatus = 'returned';
            else if (hasCancelled) finalStatus = 'cancelled';

            if (order.orderStatus !== finalStatus) {
                await this.orderRepository.updateOrderStatusById(orderId, finalStatus);
            }
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
        return await this.orderRepository.updateOrderStatusById(orderId, status)
    }
}

async function renderORder(req,res){
    let {page} = req.query
    let limit = 10
    let skip = (1 - page) * limit

}