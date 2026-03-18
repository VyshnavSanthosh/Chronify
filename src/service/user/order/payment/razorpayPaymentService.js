import { razorpay_key, razorpay_secret } from "../../../../config/index.js";
import BasePaymentService from "./basePaymentService.js";
import crypto from "crypto";

export default class RazorpayService extends BasePaymentService {
    constructor(razorpayClient) {
        super()
        this.razorpay = razorpayClient
    }

    async startPayment(total) {
        try {
            const razorpayAmountData = {
                amount: Math.round(total * 100),
                currency: "INR",
                receipt: `receipt_${Date.now()}`
            }
            const razorpayOrder = await this.razorpay.orders.create(razorpayAmountData)
            return {
                status: "pending",
                gateway: "razorpay",
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: razorpay_key
            };

        } catch (error) {
            console.log("Razorpay Error:", error);
            throw error;
        }
    }

    async verifyPayment(paymentData) {
        try {

            const body = paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id
            console.log("payment data :", paymentData)

            const expectedSignature = crypto.createHmac("sha256", razorpay_secret).update(body).digest("hex")
            if (expectedSignature == paymentData.razorpay_signature) {
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            console.log("Verification error due to : ", error)
        }
    }
}