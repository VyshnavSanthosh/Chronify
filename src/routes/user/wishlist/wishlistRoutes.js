import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);
// Controllers
import wishlistControllerFile from "../../../controllers/user/wishlist/wishlistController.js";
import userJwtMiddlewareFile from "../../../middleware/userJwt.js";
// Service
import wishListServiceFile from "../../../service/user/wishlist/wishlistService.js";
// Repostory
import wishListRepositoryFile from "../../../repository/user/wishListRepository.js";


// Dependency Injection
const userJwtMiddleware = new userJwtMiddlewareFile();
const wishListRepository = new wishListRepositoryFile();
const wishlistService = new wishListServiceFile(wishListRepository);
const wishlistController = new wishlistControllerFile(wishlistService);


// Routes

router.route("/wishlist")
    .get(userJwtMiddleware.verifyToken.bind(userJwtMiddleware),wishlistController.renderWishListPage.bind(wishlistController))

router.post("/wishlist/add/:productId",userJwtMiddleware.verifyToken.bind(userJwtMiddleware),wishlistController.addToWishList.bind(wishlistController))

router.delete("/wishlist/remove/:productId",userJwtMiddleware.verifyToken.bind(userJwtMiddleware),wishlistController.removeFromWishlist.bind(wishlistController))

export default router