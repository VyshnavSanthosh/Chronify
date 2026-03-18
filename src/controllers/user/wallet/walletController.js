import PaymentFactory from "../../../service/user/order/payment/paymentFactory.js";
export default class WalletController {
    constructor(walletService) {
        this.walletService = walletService
    }

    async renderWalletListPage(req, res) {
        const user = req.user
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        try {
            const { transactions, totalPages, currentPage } = await this.walletService.getAllTransactions(user._id, page, limit)

            const walletBalance = await this.walletService.getWalletBalance(user._id)

            return res.render("user/wallet/walletList", {
                user,
                walletTransactions: transactions,
                walletBalance,
                currentPage,
                totalPages
            })
        } catch (error) {
            console.log('couldnt load wallet list', error)
        }
    }

    async renderAddMoneyToWalletPage(req, res) {
        const user = req.user
        try {
            return res.render("user/wallet/addMoneyToWallet", {
                user
            })
        } catch (error) {
            console.log("couldn't load add money to wallet page :", error)
        }
    }

    async handleAddMoneyToWallet(req, res) {
        const user = req.user
        const { amount, paymentMethod } = req.body
        try {
            const paymentService = await PaymentFactory.getPaymentService(paymentMethod)

            const paymentResult = await paymentService.startPayment(amount)

            return res.json({
                success: true,
                type: "gateway_payment",
                paymentData: paymentResult
            });
        } catch (error) {

        }
    }

    async verifyPayment(req, res) {
        const userId = req.user._id
        const { paymentData, paymentMethod, amount } = req.body

        try {
            const paymentService = PaymentFactory.getPaymentService(paymentMethod)
            const verificationResult = await paymentService.verifyPayment(paymentData)
            if (!verificationResult.success) {
                return res.json({
                    success: false,
                    message: "Payment verification failed"
                });
            }
            await this.walletService.addMoney(amount, paymentData.razorpay_payment_id, userId, "credit", "wallet_topup")
        } catch (error) {

        }
    }
}