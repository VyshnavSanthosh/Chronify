const express = require("express");
const router = express.Router();

// Controllers
const addCategoryFile = require('../../../controllers/admin/category/addCategoryController');

// Services
const categoryServiceFile = require("../../../service/admin/category/categoryService")


// Repository
const categoryRepositoryFile = require("../../../repository/admin/category")


// Validators
const joi_category = require("../../../utils/validators/joi_category")
const validator = require("../../../utils/validators/validator")

// Dependency Injection

const categoryRepository = new categoryRepositoryFile();
const categoryService = new categoryServiceFile(categoryRepository)
const addCategoryController = new addCategoryFile(categoryService, joi_category, validator)


// Routes

router.route("/category/add")
    .get(addCategoryController.renderAddCategoryPage.bind(addCategoryController))
    .post(addCategoryController.handleAddCategory.bind(addCategoryController))


module.exports = router