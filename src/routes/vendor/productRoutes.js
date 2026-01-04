const express = require("express");
const router = express.Router();

const createUploader = require("../../utils/multer");
const {verifyToken} = require("../../middleware/vendorJwt")
// Controller
const addProductControllerFile = require("../../controllers/vendor/products/addProductController")


// Dependency injection

const addProductController = new addProductControllerFile()


// multer config
// only allow images 
const imgUpload = createUploader("IMAGES", "src/public/uploads", 10 * 1024 * 1024)
console.log("imgUpload type:", typeof imgUpload);

// Routes

//   add product route 
router.route("/products/add")
    .get(verifyToken, addProductController.renderAddProductPage.bind(addProductController))
    // .post(verifyToken, imgUpload.fields([
    //     { name: 'gstDocument', maxCount: 1 },
    //     { name: 'panCard', maxCount: 1 },
    //     { name: 'tradeLicense', maxCount: 1 }
    // ]), addProductController.handleAddProducts.bind(addProductController))

module.exports = router;