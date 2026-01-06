const express = require('express');
const router = new express.Router()


// Contorllers
const vendorListContorllerFile = require("../../../controllers/admin/vendorList/vendorListControler")


// Services
const vendorListServiceFile = require("../../../service/admin/vendorList/vendorListService")

// repositories
const vendorRepositoryFile = require("../../../repository/vendor");


// Dependency Injection
const vendorRepository = new vendorRepositoryFile()

const vendorListService = new vendorListServiceFile(vendorRepository)

const vendorListController = new vendorListContorllerFile(vendorListService)


// Routes
router.route("/vendors")
    .get(vendorListController.renderVendorListPage.bind(vendorListController))

router.patch("/vendors/:vendorId/toggle-block", vendorListController.toggleVendorBlock.bind(vendorListController));

module.exports = router