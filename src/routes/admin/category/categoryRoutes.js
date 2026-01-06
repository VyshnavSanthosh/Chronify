const express = require("express");
const router = express.Router();

// Controllers
const addCategoryFile = require('../../../controllers/admin/category/addCategoryController');

const categoryListControllerFile = require("../../../controllers/admin/category/categoryListController")


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
const categoryListController = new categoryListControllerFile(categoryService)


// Routes

router.route("/category/add")
    .get(addCategoryController.renderAddCategoryPage.bind(addCategoryController))
    .post(addCategoryController.handleAddCategory.bind(addCategoryController))

router.get("/category", categoryListController.renderCategoryListPage.bind(categoryListController))

router.patch("/category/:categoryId/toggle-listing", categoryListController.toggleCategoryListing.bind(categoryListController));

router.route("/category/edit/:categoryId")
    .get(categoryListController.renderEditCategoryPage.bind(categoryListController))
    .post(categoryListController.handleCategoryEdit.bind(categoryListController))

module.exports = router