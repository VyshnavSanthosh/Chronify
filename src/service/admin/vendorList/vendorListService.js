module.exports = class VendorListService {
    constructor(vendorRepository) {
        this.vendorRepository = vendorRepository
    }

    async getVendorList(search, page, status, sort){
        const limit = 10;
        const skip = (page - 1) * limit

        let sortOrder = -1
        let sortField = "createdAt"
        if (sort == "za") {
            sortOrder = -1
            sortField = "brandName"
        }
        else if (sort == "az") {
            sortOrder = 1
            sortField = "brandName"
        }
        const {vendors, totalVendors} = await this.vendorRepository.getAllVendors(limit, skip, sortOrder, search, status,sortField)
        return {vendors, totalVendors}
    }

    async toggleVendorBlockStatus(vendorId, isBlocked) {
        const updatedVendor = await this.vendorRepository.updateVendorBlockStatus(vendorId, isBlocked)
        return updatedVendor
    }
}