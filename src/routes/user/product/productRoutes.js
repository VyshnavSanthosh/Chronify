import express from "express";
const router = express.Router()

import noCache from "../../../middleware/nocache.js";
router.use(noCache);
// Controllers
import productListControllerFile from "../../../controllers/user/products/products.js";
import productDetailControllerFile from "../../../controllers/user/products/productDetailController.js";
// Service
import productServiceFile from "../../../service/user/product/productService.js";
import userJwtMiddlewareFile from "../../../middleware/userJwt.js";
import wishListServiceFile from "../../../service/user/wishlist/wishlistService.js";

// Repository
import productRepositoryFile from "../../../repository/vendor/productRepository.js";
import wishListRepositoryFile from "../../../repository/user/wishListRepository.js";

// Dependency Injection
const productRepository = new productRepositoryFile()
const wishListRepository = new wishListRepositoryFile()
const productService = new productServiceFile(productRepository)
const wishListService = new wishListServiceFile(wishListRepository)

const productListController = new productListControllerFile(productService, wishListService)
const userJwtMiddleware = new userJwtMiddlewareFile();
const productDetailController = new productDetailControllerFile(productService, wishListService);

// Routes
router.route("/products")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), productListController.renderUserProductListPage.bind(productListController))
router.route("/products/:productId")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware), productDetailController.renderProductDetailPage.bind(productDetailController))


export default router;