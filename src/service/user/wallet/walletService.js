export default class WalletService {
    constructor(walletRepository) {
        this.walletRepository = walletRepository
    }

    async addMoney(amount, transactionId, userId, type, source, description = null) {
        
        await this.walletRepository.addMoney(amount, transactionId, userId, type, source, description)
    }

    async getAllTransactions(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const { transactions, totalTransactions } = await this.walletRepository.getAllTransactionsByUserId(userId, skip, limit);
        const totalPages = Math.ceil(totalTransactions / limit);

        return {
            transactions,
            totalTransactions,
            totalPages,
            currentPage: page
        };
    }

    async getWalletBalance(userId) {
        return await this.walletRepository.getWalletBalanceByUserId(userId)
    }

    async debit(total, userId) {
        const balance = await this.walletRepository.getWalletBalanceByUserId(userId)

        if (!(balance >= total)) {
            throw new Error("Insufficient balance in your wallet");
        }

        return await this.walletRepository.deductMoney(total, userId, "debit", "order_payment")
    }
}