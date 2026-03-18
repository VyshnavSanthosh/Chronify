import Wallet from "../../models/user/walletSchema.js";
import crypto from "crypto";

export default class WalletRepository {

    async getAllTransactionsByUserId(userId, skip = 0, limit = 10) {
        try {
            const transactions = await Wallet.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalTransactions = await Wallet.countDocuments({ userId });

            return { transactions, totalTransactions };
        } catch (error) {
            console.log("Couldn't get transactions :", error)

            throw new Error("Couldn't get transactions for this user");
        }
    }

    async addMoney(amount, transactionId, userId, type, source, description = null) {

        const existing = await Wallet.findOne({ transactionId });
        if (existing) {
            throw new Error("Transaction already processed");
        }

        const transaction = await Wallet.create({
            transactionId,
            userId,
            amount,
            type,
            source,
            description
        });
        console.log(transaction)


        return transaction;
    }

    async getWalletBalanceByUserId(userId) {

        const result = await Wallet.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalCredits: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0]
                        }
                    },
                    totalDebits: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0]
                        }
                    }
                }
            }
        ]);

        if (!result.length) return 0;

        return result[0].totalCredits - result[0].totalDebits;
    }

    async deductMoney(amount, userId, type, source) {

        const transactionId = "TXN" + crypto.randomBytes(8).toString("hex").toUpperCase();

        const transaction = await Wallet.create({
            transactionId,
            userId,
            amount,
            type,
            source
        });
        console.log(transaction)


        return transaction;
    }
}
