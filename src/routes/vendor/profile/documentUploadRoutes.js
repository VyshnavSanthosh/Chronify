const express = require("express");
const router = express.Router();

const createUploader = require("../../../utils/multer");
const {verifyToken} = require("../../../middleware/vendorJwt") 


// Controllers
const documentUploadControllerFile = require("../../../controllers/vendor/profile/documentUploadController")

// Service
const documentUploadServiceFile = require("../../../service/vendor/profile/documentUploadService")

// Repository
const documentUploadRepositoryFile = require("../../../repository/vendor/vendorDocumentUpload");



// ========== Dependency Injection ==========


const documentUploadRepository = new documentUploadRepositoryFile()

const documentUploadService = new documentUploadServiceFile(documentUploadRepository)

const documentUploadController = new documentUploadControllerFile(documentUploadService)

// Multer Configuration
// Only allow PDF files for document uploads
const pdfUpload = createUploader('PDF', 'src/public/uploads/', 5 * 1024 * 1024);
console.log("pdfUpload",typeof pdfUpload); // should be "function"


// ========== Routes ==========


// upload
router.route("/profile/uploads")
    .get(verifyToken, documentUploadController.renderDocumentUploadPage.bind(documentUploadController))
    .post(verifyToken, pdfUpload.fields([
        { name: 'gstDocument', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'tradeLicense', maxCount: 1 }
    ]),documentUploadController.uploadDocuments.bind(documentUploadController))

module.exports = router;