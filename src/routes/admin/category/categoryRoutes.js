import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

// Controllers
import AddCategoryController from "../../../controllers/admin/category/addCategoryController.js";
import CategoryListController from "../../../controllers/admin/category/categoryListController.js";
import CategoryService from "../../../service/admin/category/categoryService.js";
import CategoryRepository from "../../../repository/admin/category.js";
import joi_category from "../../../utils/validators/joi_category.js";
import validator from "../../../utils/validators/validator.js";
import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";

// Dependency Injection

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository)
const adminJwtMiddleware = new adminJwtMiddlewareFile();
const addCategoryController = new AddCategoryController(categoryService, joi_category, validator)
const categoryListController = new CategoryListController(categoryService, joi_category, validator)


// Routes

router.route("/category/add")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), addCategoryController.renderAddCategoryPage.bind(addCategoryController))
    .post(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), addCategoryController.handleAddCategory.bind(addCategoryController))

router.get("/category", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), categoryListController.renderCategoryListPage.bind(categoryListController))

router.patch("/category/:categoryId/toggle-listing", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), categoryListController.toggleCategoryListing.bind(categoryListController));

router.route("/category/edit/:categoryId")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), categoryListController.renderEditCategoryPage.bind(categoryListController))
    .post(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), categoryListController.handleCategoryEdit.bind(categoryListController))

export default router;