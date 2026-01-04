module.exports = class ProfileController {
    constructor(profileService) {
        this.profileService = profileService
    }

    async renderProfilePage(req, res){
        try {
            const vendorPayload = req.vendor
            const vendorEmail = vendorPayload.brandEmail
            const vendor = await this.profileService.getVendor(vendorEmail)
            
            if (!vendor) {
                return res.status(404).json({
                    success: false,
                    error: "Vendor profile not found"
                })
            }
            
            return res.render("vendor/profile/profile", {
                brandName: vendor.brandName,
                brandEmail: vendor.brandEmail,
                brandPhone: vendor.mobileNumber
            })
        } catch (err) {
            console.error("Error loading vendor profile:", err)
            return res.status(500).json({
                success: false,
                error: "Failed to load vendor profile"
            })
        }
    }
}