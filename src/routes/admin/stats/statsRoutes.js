import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

// Controllers
import salesReportControllerFile from "../../../controllers/admin/stats/salesReportController.js";
import dashboardControllerFile from "../../../controllers/admin/stats/dashboardController.js";

import adminJwtMiddlewareFile from "../../../middleware/adminJwt.js";


// Dependency Injection
const adminJwtMiddleware = new adminJwtMiddlewareFile();

const salesReportController = new salesReportControllerFile();
const dashboardController = new dashboardControllerFile();


// Routes
router.route("/dashboard")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
        dashboardController.renderDashboard.bind(dashboardController))


// Routes
router.route("/sales-report")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
        salesReportController.renderSalesReportPage.bind(salesReportController))

router.route("/sales-report/download")
    .get(adminJwtMiddleware.verifyToken.bind(adminJwtMiddleware),
        salesReportController.downloadSalesReport.bind(salesReportController))

export default router