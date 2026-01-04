const express = require("express");
const router = express.Router();
const {verifyToken} = require("../../middleware/vendorJwt") 

// Controller

const dashboardControllerFile = require("../../controllers/vendor/dashboard/dashboardController")

// ========== Dependency Injection ==========

const dashboardController = new dashboardControllerFile()

// Routes

router.route("/dashboard")
    .get(verifyToken, dashboardController.rendorDashboardPage.bind(dashboardController))

module.exports = router;