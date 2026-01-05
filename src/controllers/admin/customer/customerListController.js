module.exports = class CustomerListContorller {
    constructor(customerListService) {
        this.customerListService = customerListService
    }

    async renderCustomerListPage(req,res){
            const search = req.query.search || "";
            const page = parseInt(req.query.page) || 1;
            const status = req.query.status || "";
            const sort = req.query.sort || "";
            
        try {
            const {customers, totalCustomers} = await this.customerListService.getCustomerList(search, page, status, sort)

            let CustomerStatus = "Active"
            if (customers.isBlocked) {
                CustomerStatus = "Blocked"
            }
            return res.status(200).render("admin/customer/customerList",{
                customers,
                CustomerStatus,
                totalCustomers,
                currentPage: page
            })
            
        } catch (error) {
            console.error("Render customer page error:", error);
            return res.status(500).render("error", {
                message: "Unable to load add category page"
            });
        }
    }

    async toggleCustomerBlock(req,res){
        try {
            const {customerId} = req.params
            const {isBlocked} = req.body
            
            if (!customerId) {                
                return res.status(400).json({
                    success: false,
                    message: "Customer ID is required"
                })
            }

            const updatedCustomer = await this.customerListService.toggleCustomerBlockStatus(customerId, isBlocked)

            return res.status(200).json({
                success: true,
                message: `Customer ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
                customer: updatedCustomer
            })

        } catch (error) {
            console.error("Toggle customer block error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to update customer status"
            });
        }
    }
}