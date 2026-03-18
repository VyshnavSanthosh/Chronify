export default class VendorListService {
    constructor(vendorRepository) {
        this.vendorRepository = vendorRepository
    }

    async getAllNotApprovedVendors(page) {
        const limit = 10
        const skip = (page - 1) * limit
        const { vendors, totalVendors } = await this.vendorRepository.getNotApprovedVendors(limit, skip)
        
        return { vendors, totalVendors }
    }

    async approveVendor(vendorId) {
        const approvedVendor = await this.vendorRepository.setApproved(vendorId)
        if (!approvedVendor) {
            throw new Error("Vendor not found")
        }
        return approvedVendor
    }

    async rejectVendor(vendorId) {
        const deleteed = await this.vendorRepository.deleteById(vendorId)
        if (!deleteed) {
            throw new Error("Couldn't delete vendor");
        }
    }

}