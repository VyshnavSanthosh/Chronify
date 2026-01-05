const express = require('express');
const router = new express.Router()


// Contorllers
const customerListContorllerFile = require("../../../controllers/admin/customer/customerListController")


// Services
const customerListServiceFile = require("../../../service/admin/customer/customerListService")

// repositories
const userRepositoryFile = require("../../../repository/user");
const { route } = require('../category/categoryRoutes');


// Dependency Injection
const userRepository = new userRepositoryFile()

const customerListService = new customerListServiceFile(userRepository)

const customerListController = new customerListContorllerFile(customerListService)


// Routes
router.route("/customers")
    .get(customerListController.renderCustomerListPage.bind(customerListController))

router.patch("/customers/:customerId/toggle-block", customerListController.toggleCustomerBlock.bind(customerListController))


module.exports = router