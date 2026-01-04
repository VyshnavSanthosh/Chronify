const { uploadToCloudinary } = require('../../../utils/cloudinary');
module.exports = class DocumentUploadController {
    constructor(documentUploadService) {
        this.documentUploadService = documentUploadService
    }

    renderDocumentUploadPage(req,res){
        try {
            return res.render("vendor/profile/documentUpload");
        } catch (error) {
            return res.status(500).render("error", { 
                message: "Error loading upload page" 
            });
        }
    }

    // req.files = {
    //     gstDocument: [
    //         {
    //         fieldname: 'gstDocument',
    //         originalname: 'gst.pdf',
    //         encoding: '7bit',
    //         mimetype: 'application/pdf',
    //         destination: 'uploads/',
    //         filename: 'gstDocument-123456.pdf',
    //         path: 'uploads/gstDocument-123456.pdf',
    //         size: 245632
    //         }
    //     ],

    //     panCard: [
    //         {
    //         fieldname: 'panCard',
    //         originalname: 'pan.jpg',
    //         path: 'uploads/panCard-987654.jpg',
    //         size: 132543
    //         }
    //     ],

    //     tradeLicense: [
    //         {
    //         fieldname: 'tradeLicense',
    //         originalname: 'license.png',
    //         path: 'uploads/tradeLicense-456789.png',
    //         size: 342112
    //         }
    //     ]
    //     }


    async uploadDocuments(req,res){
        try {
            if (!req.files || Object.keys(req.files).length == 0) {
                return res.status(400).json({
                success: false,
                message: "No files uploaded. Please select at least one document."
                });
            }

            const documentTypes = ['gstDocument', 'panCard', 'tradeLicense'];
            const vendorId = req.vendor.id
            const uploadedDocuments = {} // to store documents in db
            const errors = []
            for(let docType of  documentTypes){
                if (req.files[docType] && req.files[docType].length > 0) {
                    try {
                        const file = req.files[docType][0]
                        console.log(`Uploading ${docType}`, file.filename)

                        const cloudinaryResult = await uploadToCloudinary(file.path, `vendor-documents/${vendorId}/${docType}`)

                        uploadedDocuments[docType] = {
                            url: cloudinaryResult.secure_url,
                            publicId: cloudinaryResult.public_id,
                            filename: cloudinaryResult.original_filename,
                            size: cloudinaryResult.bytes,
                            uploadedAt: new Date(),
                            status: "pending"
                        }
                        
                        console.log(`✓ Successfully uploaded ${docType} in Cloudinary`);
                        
                    } catch (error) {
                        console.error(`Error uploading ${docType}:`, error.message);
                        errors.push({
                            field: docType,
                            message: error.message
                        });
                    }
                }
            }

            if (Object.keys(uploadedDocuments).length == 0) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload all documents",
                    errors: errors
                });
            }

            try {
                const savedDocuments = await this.documentUploadService.saveDocument(
                    vendorId,
                    uploadedDocuments
                )

                if (errors.length > 0) {
                    return res.status(207).json({
                        success: false,
                        message: "Some documents uploaded successfully, but others failed",
                        uploaded: savedDocuments,
                        errors: errors
                    });
                }
                // All uploads succeeded
                return res.json({
                    success: true,
                    message: "All documents uploaded and saved successfully",
                    data: savedDocuments
                });

            } catch (dbError) {
                console.error("Database save error:", dbError);
                return res.status(500).json({
                    success: false,
                    message: "Documents uploaded to cloud but failed to save to database",
                    error: dbError.message
                });
            }
        } catch (error) {
            console.error("Unexpected upload error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error during upload",
                error: process.env.NODE_ENV === 'development' ? error.message : "An unexpected error occurred"
            });
        }
    }

    async getVendorDocuments(req, res) {
        try {
            const vendorId = req.user.id;

            const documents = await this.documentUploadService.getVendorDocuments(vendorId);

            return res.json({
                success: true,
                data: documents
            });

        } catch (error) {
            console.error("Error fetching documents:", error);
            return res.status(500).json({
                success: false,
                message: "Error retrieving documents",
                error: error.message
            });
        }
    }


}
