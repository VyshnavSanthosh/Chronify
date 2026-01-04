const VendorDocument = require('../../models/vendor/vendorDocument');

module.exports = class DocumentRepository {
    async findByDocumentType(vendorId, documentType){
        return await VendorDocument.findOne({
            vendorId: vendorId,
            documentType: documentType
        })
    }

    async updateById(vendorId, documentData){
        return await VendorDocument.findByIdAndUpdate(
            vendorId,
            documentData
        )
    }

    async create(documentData){
        const newDocument = new VendorDocument(documentData);
        return await newDocument.save()
    }

    async findByVendorId(vendorId) { 
        return await VendorDocument.find({
            vendorId: vendorId
        }).sort({ uploadedAt: -1 });
    }
}