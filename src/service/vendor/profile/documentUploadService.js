const { deleteFromCloudinary } = require("../../../utils/cloudinary");

module.exports = class DocumentUploadService {
    constructor(documentUploadRepository) {
        this.documentUploadRepository = documentUploadRepository
    }

    async saveDocument(vendorId, uploadedDocuments){
        try {
            const savedDocs = {}
            for(const [docType, docData] of Object.entries(uploadedDocuments)){
                
                if (!docData) {
                    throw new Error("Document data not found");
                    
                }

                const existingDocument = await this.documentUploadRepository.findByDocumentType(vendorId, docType)

                const documentData = {
                    vendorId: vendorId,
                    documentType: docType,
                    cloudinaryUrl: docData.url,
                    publicId: docData.publicId,
                    filename: docData.filename,
                    size: docData.size,
                    status: docData.status,
                    uploadedAt: docData.uploadedAt,
                    verifiedAt: null,
                    rejectionReason: null
                }                
                
                let savedDoc
                if (existingDocument) {

                    await deleteFromCloudinary(existingDocument.publicId)

                    savedDoc = await this.documentUploadRepository.updateById(
                        existingDocument._id,
                        documentData
                    )
                }
                else{
                    savedDoc = await this.documentUploadRepository.create(documentData)
                }

                savedDocs[docType] = {
                    vendorId: savedDoc.vendorId,
                    documentType: savedDoc.documentType,
                    cloudinaryUrl: savedDoc.cloudinaryUrl,
                    publicId: savedDoc.publicId,
                    filename: savedDoc.filename,
                    size: savedDoc.size,
                    status: savedDoc.status,
                    uploadedAt: savedDoc.uploadedAt,
                    verifiedAt: savedDoc.verifiedAt,
                    rejectionReason: savedDoc.rejectionReason
                }
            }
            console.log("✅ Documents saved in database")
            
            return savedDocs

        } catch (error) {
            console.error("Error saving documents:", error);
            throw new Error(`Failed to save documents: ${error.message}`);
        }
    }

    async getVendorDocuments(vendorId){
        return await this.documentUploadRepository.findByVendorId(vendorId)
    }
}