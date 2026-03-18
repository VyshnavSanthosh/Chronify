import express from "express";
const router = express.Router();

import noCache from "../../../middleware/nocache.js";
router.use(noCache);
// Repostory
import orderRepositoryFile from "../../../repository/user/orderRepository.js";

// Service
import adminOrderServiceFile from "../../../service/admin/order/orderService.js";
import userOrderServiceFile from "../../../service/user/order/orderService.js"

// Controller
import adminOrderControllerFile from "../../../controllers/admin/order/orderController.js";

import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";

// Dependency Injection
const adminJwtMiddleware = new adminJwtMiddlewareFile();

const orderRepository = new orderRepositoryFile();
const adminOrderService = new adminOrderServiceFile(orderRepository);
const orderService = new userOrderServiceFile(orderRepository);
const adminOrderController = new adminOrderControllerFile(adminOrderService, orderService);

// Routes
router.get("/orders", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), adminOrderController.renderOrderListPage.bind(adminOrderController));

router.route("/orders/:orderId")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), adminOrderController.renderOrderDetailPage.bind(adminOrderController))

export default router;
