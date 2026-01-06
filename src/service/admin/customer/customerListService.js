module.exports = class CustomerListService {
    constructor(userRepository) {
        this.userRepository = userRepository
    }

    async getCustomerList(search, page, status, sort){
        const limit = 10;
        const skip = (page - 1) * limit;

        let sortOrder = -1
        let sortField = 'createdAt';
        if (sort === "za") {
            sortOrder = -1;
            sortField = 'firstName';
        } else if (sort === "za") {
            sortOrder = -1;
            sortField = 'firstName';
        }

        
        const {customers, totalCustomers} = await this.userRepository.getAllCustomers(limit, skip, sortOrder, search, status,sortField)
        return {customers, totalCustomers}
    }

    async toggleCustomerBlockStatus(customerId, isBlocked){
        const updatedCustomer = await this.userRepository.updateCustomerBlockStatus(
            customerId,
            isBlocked
        )
        return updatedCustomer
    }
}