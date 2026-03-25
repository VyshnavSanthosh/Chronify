import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

import vendorJwtMiddlewareFile from "../../../middleware/vendorJwt.js";
import checkVendorApproval from "../../../middleware/checkVendorApproval.js";

// Repostory
import orderRepositoryFile from "../../../repository/user/orderRepository.js";
import productRepositoryFile from "../../../repository/vendor/productRepository.js";
import walletRepositoryFile from "../../../repository/user/walletRepository.js"
// Service
import vendorOrderServiceFile from "../../../service/vendor/order/orderService.js";
import vendorReturnServiceFile from "../../../service/vendor/order/vendorReturnService.js";
import productInventoryServiceFile from "../../../service/vendor/product/inventoryService.js";

// Controller
import vendorOrderControllerFile from "../../../controllers/vendor/order/orderController.js";

// Repository
import returnRepositoryFile from "../../../repository/user/returnRepository.js";
import productInventoryRepositoryFile from "../../../repository/vendor/productInventoryRepository.js.js";

// Dependency Injection
const vendorJwtMiddleware = new vendorJwtMiddlewareFile();
const orderRepository = new orderRepositoryFile();
const productRepository = new productRepositoryFile();
const returnRepository = new returnRepositoryFile();
const productInventoryRepository = new productInventoryRepositoryFile();
const walletRepository = new walletRepositoryFile();

const vendorOrderService = new vendorOrderServiceFile(orderRepository, productRepository);
const productInventoryService = new productInventoryServiceFile(productInventoryRepository);
const vendorReturnService = new vendorReturnServiceFile(returnRepository, orderRepository, productInventoryService, walletRepository);
const vendorOrderController = new vendorOrderControllerFile(vendorOrderService, vendorReturnService);

// Routes
router.get("/orders",
    vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware),
    checkVendorApproval,
    vendorOrderController.renderOrderListPage.bind(vendorOrderController)
);

router.route("/orders/:orderId")
    .get(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, vendorOrderController.renderOrderDetailPage.bind(vendorOrderController))

router.patch('/update-order-status/:orderId', vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, vendorOrderController.updateOrderStatus.bind(vendorOrderController))
router.patch('/update-item-status/:orderId/:sku', vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, vendorOrderController.updateItemStatus.bind(vendorOrderController))

// Return Management
router.get("/returns",
    vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware),
    checkVendorApproval,
    vendorOrderController.renderReturnListPage.bind(vendorOrderController)
);

router.post("/returns/:returnId/approve",
    vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware),
    checkVendorApproval,
    vendorOrderController.approveReturn.bind(vendorOrderController)
);

router.post("/returns/:returnId/reject",
    vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware),
    checkVendorApproval,
    vendorOrderController.rejectReturn.bind(vendorOrderController)
);


export default router;
