import express from "express";
const router = express.Router();
import noCache from "../../../middleware/nocache.js";
router.use(noCache);

import createUploader from "../../../utils/multer.js";
import { initialVerifyToken } from "../../../middleware/vendorInitialJwt.js";
import DocumentUploadController from "../../../controllers/vendor/profile/documentUploadController.js";
import DocumentUploadService from "../../../service/vendor/profile/documentUploadService.js";
import DocumentUploadRepository from "../../../repository/vendor/vendorDocumentUpload.js";



// ========== Dependency Injection ==========


const documentUploadRepository = new DocumentUploadRepository()

const documentUploadService = new DocumentUploadService(documentUploadRepository)

const documentUploadController = new DocumentUploadController(documentUploadService)

// Multer Configuration
// Only allow PDF files for document uploads
const pdfUpload = createUploader('PDF', 'src/public/uploads/', 5 * 1024 * 1024);
console.log("pdfUpload", typeof pdfUpload); // should be "function"


// ========== Routes ==========


// upload
router.route("/profile/uploads")
    .get(initialVerifyToken, documentUploadController.renderDocumentUploadPage.bind(documentUploadController))
    .post(initialVerifyToken, pdfUpload.fields([
        { name: 'gstDocument', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'tradeLicense', maxCount: 1 }
    ]), documentUploadController.uploadDocuments.bind(documentUploadController))

export default router;