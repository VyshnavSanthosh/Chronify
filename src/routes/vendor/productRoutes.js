import express from "express";
const router = express.Router();
import noCache from "../../middleware/nocache.js";
router.use(noCache);

import validator from "../../utils/validators/validator.js";
import joi_product from "../../utils/validators/joi_product.js";
import createUploader from "../../utils/multer.js";
import vendorJwtMiddlewareFile from "../../middleware/vendorJwt.js";
import checkVendorApproval from "../../middleware/checkVendorApproval.js";
import AddProductController from "../../controllers/vendor/products/addProductController.js";
import ProductListController from "../../controllers/vendor/products/productListController.js";
import AddProductService from "../../service/vendor/product/productService.js";
import CategoryRepository from "../../repository/admin/category.js";
import ProductRepository from "../../repository/vendor/productRepository.js";



// Dependency injection

const categoryRepository = new CategoryRepository()
const addProductRepository = new ProductRepository()
const vendorJwtMiddleware = new vendorJwtMiddlewareFile();

const addProductService = new AddProductService(categoryRepository, addProductRepository)
const addProductController = new AddProductController(addProductService, joi_product, validator)
const productListController = new ProductListController(addProductService, joi_product, validator)

// multer config
// only allow images 
const imgUpload = createUploader("IMAGES", "src/public/uploads", 10 * 1024 * 1024)

// Routes

//   add product route 
router.route("/products/add")
    .get(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, addProductController.renderAddProductPage.bind(addProductController))
    .post(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, imgUpload.any(), addProductController.handleAddProducts.bind(addProductController))

router.route("/products")
    .get(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, productListController.renderProductListingPage.bind(productListController))


router.route("/products/:productId/toggle-list")
    .patch(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, productListController.toggleProductListing.bind(productListController));

router.route("/products/:productId")
    .delete(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, productListController.deleteProduct.bind(productListController));

router.route("/products/:productId/edit")
    .get(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, productListController.renderEditProductPage.bind(productListController))
    .post(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, imgUpload.any(), productListController.handleEditProduct.bind(productListController))

export default router;