module.exports = class ProfileService {
    constructor(vendorRepository) {
        this.vendorRepository = vendorRepository
    }

    async getVendor(vendorEmail){
        const vendor = await this.vendorRepository.findByEmail(vendorEmail)
        return vendor
    }
}