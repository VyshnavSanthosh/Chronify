import VendorDashboardService from "../../../service/vendor/stats/vendorDashboardService.js";

export default class DashboardController {
    constructor() {
        this.vendorDashboardService = new VendorDashboardService();
    }

    async rendorDashboardPage(req, res) {
        try {
            const { period = 'monthly' } = req.query;
            const vendorId = req.user._id;
            const dashboardData = await this.vendorDashboardService.getDashboardData(vendorId, period);

            return res.render("vendor/dashboard", {
                user: req.user,
                title: "Vendor Dashboard",
                activePage: 'dashboard',
                ...dashboardData
            });
        } catch (error) {
            console.error("Error rendering vendor dashboard:", error);
            res.status(500).render("error", { message: "Failed to load vendor dashboard" });
        }
    }
}