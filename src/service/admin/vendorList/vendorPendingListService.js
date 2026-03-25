import { v2 as cloudinary } from "cloudinary";
import { cloudinary_name, cloudinary_api_key, cloudinary_api_secret } from "../../../config/index.js";

cloudinary.config({
    cloud_name: cloudinary_name,
    api_key: cloudinary_api_key,
    api_secret: cloudinary_api_secret
});

export default class VendorPendingListService {
    constructor(vendorRepository, vendorDocumentRepository) {
        this.vendorRepository = vendorRepository;
        this.vendorDocumentRepository = vendorDocumentRepository;
    }

    async getAllNotApprovedVendors(page) {
        const limit = 10;
        const skip = (page - 1) * limit;
        const { vendors, totalVendors } = await this.vendorRepository.getNotApprovedVendors(limit, skip);

        const vendorsWithDocs = await Promise.all(vendors.map(async (vendor) => {
            const documents = await this.vendorDocumentRepository.findByVendorId(vendor._id);

            const signedDocuments = documents.map(doc => {
                const docObj = doc.toObject();
                const resourceType = docObj.resourceType || 'image';
                const deliveryType = docObj.deliveryType || 'authenticated';

                // Use private_download_url for authenticated Cloudinary resources.
                // This generates a proper time-limited signed URL for secure delivery.
                docObj.cloudinaryUrl = cloudinary.utils.private_download_url(
                    docObj.publicId,
                    'pdf',
                    {
                        resource_type: resourceType,
                        type: deliveryType,
                        expires_at: Math.floor(Date.now() / 1000) + 3600
                    }
                );

                return docObj;
            });

            return {
                ...vendor.toObject(),
                documents: signedDocuments
            };
        }));

        return { vendors: vendorsWithDocs, totalVendors };
    }

    async approveVendor(vendorId) {
        const approvedVendor = await this.vendorRepository.setApproved(vendorId);
        if (!approvedVendor) throw new Error("Vendor not found");
        return approvedVendor;
    }

    async rejectVendor(vendorId) {
        const deleted = await this.vendorRepository.deleteById(vendorId);
        if (!deleted) throw new Error("Couldn't delete vendor");
    }
}