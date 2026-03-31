import express from "express";
const router = express.Router();

import noCache from "../../../middleware/nocache.js";
router.use(noCache);
import validator from "../../../utils/validators/validator.js";
import joi_address from "../../../utils/validators/joi_address.js";

// Controllers
import orderControllerFile from "../../../controllers/user/order/checkoutController.js";
import orderListControllerFile from "../../../controllers/user/order/orderListController.js";
import userJwtMiddlewareFile from "../../../middleware/userJwt.js";

// Service
import orderServiceFile from "../../../service/user/order/orderService.js";
import addressServiceFile from "../../../service/user/address/addressService.js";
import productInventoryServiceFile from "../../../service/vendor/product/inventoryService.js";
import couponServiceFile from "../../../service/admin/coupon/couponService.js";

// Repostory
import addressRepositoryFile from "../../../repository/user/addressRepository.js";
import cartRepositoryFile from "../../../repository/user/cartRepository.js";
import orderRepositoryFile from "../../../repository/user/orderRepository.js";
import returnRepositoryFile from "../../../repository/user/returnRepository.js";
import productInventoryRepositoryFile from "../../../repository/vendor/productInventoryRepository.js.js";
import productRepositoryFile from "../../../repository/vendor/productRepository.js";
import categoryRepositoryFile from "../../../repository/admin/category.js";
import couponRepositoryFile from "../../../repository/admin/coupon.js";
import walletRepositoryFile from "../../../repository/user/walletRepository.js";
import VendorRepositoryFile from "../../../repository/vendor.js";

import emailQueue from "../../../queues/emailQueue.js";


// Dependency Injection
const userJwtMiddleware = new userJwtMiddlewareFile();
const cartRepository = new cartRepositoryFile();
const addressRepository = new addressRepositoryFile();
const orderRepository = new orderRepositoryFile();
const returnRepository = new returnRepositoryFile();
const productInventoryRepository = new productInventoryRepositoryFile();
const productRepository = new productRepositoryFile();
const categoryRepository = new categoryRepositoryFile();
const couponRepository = new couponRepositoryFile();
const walletRepository = new walletRepositoryFile();
const vendorRepository = new VendorRepositoryFile();

const addressService = new addressServiceFile(addressRepository);
const productInventoryService = new productInventoryServiceFile(productInventoryRepository);
const couponService = new couponServiceFile(couponRepository);
const orderService = new orderServiceFile(orderRepository, addressRepository, cartRepository, returnRepository, productInventoryService, emailQueue, productRepository, categoryRepository, couponRepository, walletRepository, vendorRepository);

const orderController = new orderControllerFile(orderService, addressService, validator, joi_address, couponService, productInventoryService);
const orderListController = new orderListControllerFile(orderService);
// Routes

router.post("/checkout/couponCode",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderController.checkCoupon.bind(orderController)
)

router.get("/checkout/available-coupons",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderController.getAvailableCoupons.bind(orderController)
)

router.route("/checkout/:cartId")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
        orderController.renderCheckoutPage.bind(orderController))
    .post(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
        orderController.handleCheckout.bind(orderController))

router.route("/checkout/:cartId/add-address")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
        orderController.renderAddAddressPage.bind(orderController))
    .post(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
        orderController.handleAddAddress.bind(orderController))

router.post("/checkout/payment/verify",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderController.verifyPayment.bind(orderController)
)

router.post("/checkout/payment/cancel",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderController.handleCancel.bind(orderController)
)

router.get("/orders",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware), orderListController.renderOrderListPage.bind(orderListController)
)
router.route("/:userId/orders/:orderId")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), orderListController.renderOrderDetailPage.bind(orderListController)
    )
router.get("/:userId/orders/:orderId/invoice",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderListController.downloadInvoice.bind(orderListController)
)
router.post("/:userId/orders/:orderId/cancel",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderListController.cancelOrder.bind(orderListController)
)
router.post("/:userId/orders/:orderId/items/:sku/cancel",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderListController.cancelOrderItem.bind(orderListController)
)
router.post("/:userId/orders/:orderId/return",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderListController.returnOrder.bind(orderListController)
)

router.post("/:userId/orders/:orderId/items/:sku/return",
    userJwtMiddleware.verifyToken.bind(userJwtMiddleware),
    orderListController.returnOrderItem.bind(orderListController)
)



export default router