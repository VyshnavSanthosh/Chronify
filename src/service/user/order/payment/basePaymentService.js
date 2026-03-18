export default class BasePaymentService {
    constructor() {
        if (new.target == BasePaymentService) {
            throw new Error("BasePaymentService cannot be used directly");
        }
    }
    async startPayment(orderData){
        throw new Error("This is base payment method call the child method to start payment");
    }

    async verifyPayment(paymentData){
        throw new Error("This is base payment method call the child method to verify payment");
    }

}