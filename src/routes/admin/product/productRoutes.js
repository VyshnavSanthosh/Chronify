import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

// Controllers
import ProductListController from "../../../controllers/admin/product/productLIstController.js";
import ProductListService from "../../../service/admin/product/productListService.js";
import ProductRepository from "../../../repository/vendor/productRepository.js";
import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";


// Dependency Injection
const adminJwtMiddleware = new adminJwtMiddlewareFile();
const productRepository = new ProductRepository()
const productListService = new ProductListService(productRepository)
const productListController = new ProductListController(productListService);

// Routes
router.route("/products")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), productListController.renderProductListPage.bind(productListController))

router.route("/products/pendings")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), productListController.renderProductPendingListPage.bind(productListController))

router.patch("/products/pendings/:productId/approve", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), productListController.approveProduct.bind(productListController))
router.patch("/products/pendings/:productId/reject", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), productListController.rejectProduct.bind(productListController))

export default router;