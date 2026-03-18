import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);
// Controllers
import walletControllerFile from "../../../controllers/user/wallet/walletController.js";

// Services
import walletServiceFile from "../../../service/user/wallet/walletService.js";
// Repository
import walletRepositoryFile from "../../../repository/user/walletRepository.js";

import userJwtMiddlewareFile from "../../../middleware/userJwt.js";

// Dependency Injection
const walletRepository = new walletRepositoryFile();

const walletService = new walletServiceFile(walletRepository);

const walletController = new walletControllerFile(walletService);

const userJwtMiddleware = new userJwtMiddlewareFile();


// Routes

router.route("/wallet")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    walletController.renderWalletListPage.bind(walletController))

router.route("/wallet/handle-add-money")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    walletController.renderAddMoneyToWalletPage.bind(walletController))
    .post(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    walletController.handleAddMoneyToWallet.bind(walletController))


router.post("/wallet/verify-payment",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    walletController.verifyPayment.bind(walletController)
)
export default router