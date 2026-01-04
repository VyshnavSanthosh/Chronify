const express = require("express");
const router = express.Router();

const {verifyToken} = require("../../../middleware/vendorJwt") 
// Controllers
const profileControllerFile = require("../../../controllers/vendor/profile/profileController")

// Service
const profileServiceFile = require("../../../service/vendor/profile/profileService")

// Repository
const VendorRepository = require("../../../repository/vendor")


// ========== Dependency Injection ==========

const vendorRepository = new VendorRepository()

const profileService = new profileServiceFile(vendorRepository)

const profileController = new profileControllerFile(profileService)


// ========== Routes ==========

// profile
router.route("/profile")
    .get(verifyToken, profileController.renderProfilePage.bind(profileController))

module.exports = router;