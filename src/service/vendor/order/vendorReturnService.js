import crypto from "crypto"
export default class VendorReturnService {
    constructor(returnRepository, orderRepository, productInventoryService, walletRepository) {
        this.returnRepository = returnRepository;
        this.orderRepository = orderRepository;
        this.productInventoryService = productInventoryService;
        this.walletRepository = walletRepository
    }

    async getAllReturns(vendorId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const { returns, totalReturns } = await this.returnRepository.getReturnsByVendorId(vendorId, skip, limit);
        const totalPages = Math.ceil(totalReturns / limit);

        return {
            returns,
            totalReturns,
            totalPages,
            currentPage: page
        };
    }

    async approveReturn(returnId) {
        const returnRequest = await this.returnRepository.getReturnById(returnId);

        if (!returnRequest) throw new Error("Return request not found");
        const userId = returnRequest.userId._id;
        if (returnRequest.status !== 'pending') throw new Error("Return request is already processed");

        await this.returnRepository.updateReturnStatus(returnId, 'approved');
        let total = 0

        for (const item of returnRequest.items) {
            const itemStatus = item.status;
            if (itemStatus !== 'returned') {
                const price = (item.price * item.quantity) - (((item.price * item.quantity) * item.offer) / 100);
                total += price
                await this.orderRepository.updateOrderItemStatus(returnRequest.orderId, item.sku, 'returned');
            }
        }

        // Release stock
        const products = returnRequest.items.map(item => ({
            id: item.productId,
            sku: item.sku,
            qty: item.quantity
        }));
        await this.productInventoryService.releaseStock(products);

        const transactionId = "TXN" + crypto.randomBytes(8).toString("hex").toUpperCase();

        await this.walletRepository.addMoney(total, transactionId, userId, "credit", "return_refund");
        if (returnRequest.orderId.orderStatus === "return_requested") {
            await this.orderRepository.updateOrderStatusById(returnRequest.orderId._id, "returned")
        }
        const updatedOrder = await this.orderRepository.getOrderDetailById(returnRequest.orderId._id)

        const allItemsReturned = updatedOrder.items.every(item => item.status === 'returned');
        
        if (allItemsReturned) {
            await this.orderRepository.updateOrderStatusById(returnRequest.orderId._id, "returned")
        }

        return { success: true, message: "Return approved and stock released" };
    }

    async rejectReturn(returnId) {
        const returnRequest = await this.returnRepository.getReturnById(returnId);
        if (!returnRequest) throw new Error("Return request not found");
        if (returnRequest.status !== 'pending') throw new Error("Return request is already processed");

        await this.returnRepository.updateReturnStatus(returnId, 'rejected');

        for (const item of returnRequest.items) {
            await this.orderRepository.updateOrderItemStatus(returnRequest.orderId, item.sku, 'return_rejected');
        }



        return { success: true, message: "Return request rejected" };
    }

}
