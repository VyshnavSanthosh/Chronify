import express from "express";
const router = express.Router();
import noCache from "../../middleware/nocache.js";
router.use(noCache);
import vendorJwtMiddlewareFile from "../../middleware/vendorJwt.js";
import checkVendorApproval from "../../middleware/checkVendorApproval.js";

import DashboardController from "../../controllers/vendor/dashboard/dashboardController.js";

// ========== Dependency Injection ==========

const dashboardController = new DashboardController()
const vendorJwtMiddleware = new vendorJwtMiddlewareFile();
// Routes

router.route("/dashboard")
    .get(vendorJwtMiddleware.verifyToken.bind(vendorJwtMiddleware), checkVendorApproval, dashboardController.rendorDashboardPage.bind(dashboardController))

export default router;