import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);


// Contorllers
import VendorListController from "../../../controllers/admin/vendorList/vendorListControler.js";
import VendorPendingListController from "../../../controllers/admin/vendorList/vendorPendingListController.js";
import VendorListService from "../../../service/admin/vendorList/vendorListService.js";
import VendorPendingListService from "../../../service/admin/vendorList/vendorPendingListService.js";
import VendorRepository from "../../../repository/vendor.js";
import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";


// Dependency Injection
const adminJwtMiddleware = new adminJwtMiddlewareFile();

const vendorRepository = new VendorRepository()

const vendorListService = new VendorListService(vendorRepository)

const vendorPendingListService = new VendorPendingListService(vendorRepository)

const vendorListController = new VendorListController(vendorListService)

const vendorPendingListController = new VendorPendingListController(vendorPendingListService)


// Routes
router.route("/vendors")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
        vendorListController.renderVendorListPage.bind(vendorListController))

router.patch("/vendors/:vendorId/toggle-block", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), vendorListController.toggleVendorBlock.bind(vendorListController));

router.route("/vendors/pending")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), vendorPendingListController.renderVendorPendingListPage.bind(vendorPendingListController))

router.patch("/vendors/pending/:vendorId/approve", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), vendorPendingListController.approveVendor.bind(vendorPendingListController))

router.delete("/vendors/pending/:vendorId/reject", adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware), vendorPendingListController.rejectVendor.bind(vendorPendingListController))

export default router;