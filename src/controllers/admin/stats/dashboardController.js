import DashboardService from "../../../service/admin/stats/dashboardService.js";

export default class DashboardController {
    constructor() {
        this.dashboardService = new DashboardService();
    }

    async renderDashboard(req, res) {
        try {
            const { period = 'yearly' } = req.query;
            const dashboardData = await this.dashboardService.getDashboardData(period);

            res.render("admin/stats/dashboard", {
                user: req.user,
                title: "Dashboard",
                ...dashboardData
            });
        } catch (error) {
            console.error("Error rendering admin dashboard:", error);
            res.status(500).render("error", { message: "Failed to load dashboard" });
        }
    }
}
