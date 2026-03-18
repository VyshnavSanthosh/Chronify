export default class AddressService {
    constructor(addressRepository) {
        this.addressRepository = addressRepository
    }
    async saveAddress(data, userId) {
        return await this.addressRepository.saveAddress(data, userId)
    }

    async getAllAddress(userId) {
        return await this.addressRepository.getAllAddressByUserId(userId)
    }

    async getAddressById(id, userId) {
        return await this.addressRepository.getAddressById(id, userId)
    }

    async updateAddress(id, userId, data) {
        return await this.addressRepository.updateAddress(id, userId, data)
    }

    async deleteAddress(id, userId) {
        return await this.addressRepository.deleteAddress(id, userId)
    }
}