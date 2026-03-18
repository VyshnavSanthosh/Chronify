export default class vendorPendingListController {
    constructor(vendorPendingListService) {
        this.vendorPendingListService = vendorPendingListService
    }

    async renderVendorPendingListPage(req, res) {
        const page = parseInt(req.query.page) || 1
        try {
            const { vendors, totalVendors } = await this.vendorPendingListService.getAllNotApprovedVendors(page)
            console.log("vendors : ",vendors)


            return res.status(200).render("admin/vendorList/vendorPendingLIst", {
                vendors,
                totalVendors,
                currentPage: page
            })
        } catch (error) {
            console.error("Render vendorLIst page error:", error);
            return res.status(500).send("error", {
                message: "Unable to load add vendorList page"
            });
        }
    }

    async approveVendor(req, res) {
        try {
            const { vendorId } = req.params
            console.log(vendorId)
            if (!vendorId) {
                return res.status(400).json({
                    success: false,
                    message: "Vendor ID is required",
                    vendor: approvedVendor
                })
            }
            const approvedVendor = await this.vendorPendingListService.approveVendor(vendorId)

            return res.status(200).json({
                success: true,
                message: "Vendor approved successfully",
                vendor: approvedVendor
            });

        } catch (error) {
            console.error("Approve vendor error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Unable to approve vendor"
            });

        }
    }

    async rejectVendor(req, res) {
        const { vendorId } = req.params
        console.log(vendorId)
        if (!vendorId) {
            return res.status(400).json({
                success: false,
                message: "Vendor ID is required",
                vendor: approvedVendor
            })
        }
        try {
            await this.vendorPendingListService.rejectVendor(vendorId)
            return res.status(200).json({
                success: true,
                message: "Vendor rejected successfully"
            });
        } catch (error) {
            console.error("Reject vendor error:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Unable to reject vendor"
            });
        }
    }
}