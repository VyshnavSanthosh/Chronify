import express from "express";
const router = express.Router()

// Controllers
import homeControllerFile from "../../controllers/user/homeController.js";

// service
import productServiceFile from "../../service/user/product/productService.js";

// repository
import productRepositoryFile from "../../repository/vendor/productRepository.js";

const productRepository = new productRepositoryFile();
const productService = new productServiceFile(productRepository);
const homeController = new homeControllerFile(productService);


// Routes
router.route("/")
    .get(homeController.renderHomePage.bind(homeController))


export default router;