import express from "express";
const router = express.Router();

import noCache from "../../../middleware/nocache.js";
router.use(noCache);
// Controllers
import cartControllerFile from "../../../controllers/user/cart/cartController.js";
import userJwtMiddlewareFile from "../../../middleware/userJwt.js";
// Service
import cartServiceFile from "../../../service/user/cart/cartService.js";
// Repostory
import wishListRepositoryFile from "../../../repository/user/wishListRepository.js";
import productRepositoryFile from "../../../repository/vendor/productRepository.js";
import cartRepositoryFile from "../../../repository/user/cartRepository.js";


// Dependency Injection
const userJwtMiddleware = new userJwtMiddlewareFile();
const wishListRepository = new wishListRepositoryFile();
const productRepository = new productRepositoryFile();
const cartRepository = new cartRepositoryFile();
const cartService = new cartServiceFile(wishListRepository, productRepository, cartRepository);
const cartController = new cartControllerFile(cartService);


// Routes

router.route("/cart")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),cartController.renderCartPage.bind(cartController))

router.post("/cart/add/:productId/:sku",userJwtMiddleware.verifyToken.bind(userJwtMiddleware),cartController.addToCart.bind(cartController))

router.post("/cart/add/:productId/",userJwtMiddleware.verifyToken.bind(userJwtMiddleware),cartController.addToCartFromWishList.bind(cartController))

router.delete("/cart/remove/:sku",userJwtMiddleware.verifyToken.bind(userJwtMiddleware),cartController.delteFromCart.bind(cartController))

router.post("/cart/increase/:sku",userJwtMiddleware.verifyToken.bind(userJwtMiddleware),cartController.incrementQty.bind(cartController))

router.post("/cart/decrease/:sku",userJwtMiddleware.verifyToken.bind(userJwtMiddleware),cartController.decrementQty.bind(cartController))


export default router