import BasePaymentService from "./basePaymentService.js";
export default class WalletPaymentService extends BasePaymentService {
    constructor(walletService){
        super()
        this.walletService = walletService
    }
    async startPayment(total, userId){
        try {
            await this.walletService.debit(total, userId)
            return { status: "completed", method: "wallet" }
        } catch (error) {
            console.log("Wallet payment failed :",error)
            throw error
        }
    }
}