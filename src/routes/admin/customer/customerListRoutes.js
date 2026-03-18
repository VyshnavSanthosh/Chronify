import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);


// Contorllers
import CustomerListController from "../../../controllers/admin/customer/customerListController.js";
import CustomerListService from "../../../service/admin/customer/customerListService.js";
import UserRepository from "../../../repository/user.js";
import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";


// Dependency Injection
const userRepository = new UserRepository()
const adminJwtMiddleware = new adminJwtMiddlewareFile();

const customerListService = new CustomerListService(userRepository)

const customerListController = new CustomerListController(customerListService)


// Routes
router.route("/customers")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), customerListController.renderCustomerListPage.bind(customerListController))

router.patch("/customers/:customerId/toggle-block", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), customerListController.toggleCustomerBlock.bind(customerListController))


export default router;