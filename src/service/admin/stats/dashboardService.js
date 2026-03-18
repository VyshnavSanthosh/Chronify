import DashboardRepository from "../../../repository/admin/dashboardRepository.js";

export default class DashboardService {
    constructor() {
        this.dashboardRepository = new DashboardRepository();
    }

    async getDashboardData(period = 'monthly') {
        const [summary, salesActivity, topProducts, topCategories, topBrands, topVendors] = await Promise.all([
            this.dashboardRepository.getSummaryStats(),
            this.dashboardRepository.getSalesActivity(period),
            this.dashboardRepository.getTopSellingProducts(10),
            this.dashboardRepository.getTopSellingCategories(10),
            this.dashboardRepository.getTopSellingBrands(10),
            this.dashboardRepository.getTopSellingVendors(10)
        ]);

        let labels = [];
        let salesData = [];

        if (period === 'monthly') {
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            salesData = new Array(12).fill(0);
            salesActivity.forEach(item => {
                salesData[item._id - 1] = item.sales;
            });
        } else if (period === 'yearly') {
            salesActivity.sort((a, b) => a._id - b._id);
            labels = salesActivity.map(item => item._id.toString());
            salesData = salesActivity.map(item => item.sales);
        } else if (period === 'weekly') {
            // Sort by date to ensure continuity
            salesActivity.sort((a, b) => new Date(a._id) - new Date(b._id));
            labels = salesActivity.map(item => {
                const date = new Date(item._id);
                return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            });
            salesData = salesActivity.map(item => item.sales);
        }

        return {
            summary,
            chartData: {
                labels,
                data: salesData
            },
            topProducts,
            topCategories,
            topBrands,
            topVendors,
            currentPeriod: period
        };
    }
}
