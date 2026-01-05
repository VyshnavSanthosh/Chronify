const express = require("express");
const router = express.Router();

const createUploader = require("../../utils/multer");
const {verifyToken} = require("../../middleware/vendorJwt")
// Controller
const addProductControllerFile = require("../../controllers/vendor/products/addProductController")

// Services
const addProductServiceFile = require("../../service/vendor/product/addProductService")

// Repositories
const categoryRepositoryFile = require("../../repository/admin/category")




// Dependency injection

const categoryRepository = new categoryRepositoryFile()

const addProductService = new addProductServiceFile(categoryRepository)
const addProductController = new addProductControllerFile(addProductService)


// multer config
// only allow images 
const imgUpload = createUploader("IMAGES", "src/public/uploads", 10 * 1024 * 1024)
console.log("imgUpload type:", typeof imgUpload);

// Routes

//   add product route 
router.route("/products/add")
    .get(addProductController.renderAddProductPage.bind(addProductController))
    // .post(verifyToken, imgUpload.fields([
    //     { name: 'gstDocument', maxCount: 1 },
    //     { name: 'panCard', maxCount: 1 },
    //     { name: 'tradeLicense', maxCount: 1 }
    // ]), addProductController.handleAddProducts.bind(addProductController))

module.exports = router;