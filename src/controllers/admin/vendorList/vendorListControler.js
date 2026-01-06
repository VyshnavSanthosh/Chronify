module.exports = class VendorListController {
    constructor(vendorListService) {
        this.vendorListService = vendorListService
    }

    async renderVendorListPage(req,res){
            const search = req.query.search || "";
            const page = parseInt(req.query.page) || 1;
            const status = req.query.status || "";
            const sort = req.query.sort || "";
        try{
            const {vendors, totalVendors} = await this.vendorListService.getVendorList(search, page, status, sort)
            return res.status(200).render("admin/vendorList/vendorList",{
                vendors,
                totalVendors,
                currentPage: page
            })
        }
        catch (error) {
            console.error("Render vendorLIst page error:", error);
            return res.status(500).send("error", {
                message: "Unable to load add vendorList page"
            });
        }
    }

    async toggleVendorBlock(req,res){
        try {
            const {vendorId} = req.params
            const {isBlocked} = req.body
            
            if (!vendorId) {                
                return res.status(400).json({
                    success: false,
                    message: "Vendor ID is required"
                })
            }

            const updatedVendor = await this.vendorListService.toggleVendorBlockStatus(vendorId, isBlocked)

            return res.status(200).json({
                success: true,
                message: `Vendor ${isBlocked ? 'blacklisted' : 'activated'} successfully`,
                vendor: updatedVendor
            })

        } catch (error) {
            console.error("Toggle vendor block error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to update vendor status"
            });
        }
    }
}