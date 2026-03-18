import BasePaymentService from "./basePaymentService.js";

export default class CodPaymentService {
    async startPayment(orderData){
        return { status: "completed" }
    }

    async verifyPayment(paymentData){
        return { success: true }
    }
}