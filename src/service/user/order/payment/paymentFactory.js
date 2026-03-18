import RazorpayPaymentService from "./razorpayPaymentService.js";
import CodPaymentService from "./codPaymentService.js";
import WalletPaymentService from "./walletPaymentService.js";
import walletServiceFile from "../../wallet/walletService.js";
import walletRepositoryFile from "../../../../repository/user/walletRepository.js";
import razorpayClient from "../../../../utils/razorpayClient.js";

const walletRepository = new walletRepositoryFile();
const walletService = new walletServiceFile(walletRepository);

export default class PaymentFactory {
    static getPaymentService(method){
        if (!method) {
            throw new Error("Payment method is required");
        }
        switch (method.toLowerCase()) {
            case "razorpay":
                return new RazorpayPaymentService(razorpayClient);
        
            case "cod":
                return new CodPaymentService();

            case "wallet":
                return new WalletPaymentService(walletService);

            default:
                throw new Error(`Unsupported payment method: ${method}`);
        }
    }
}
