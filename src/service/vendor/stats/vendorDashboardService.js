import VendorDashboardRepository from "../../../repository/vendor/vendorDashboardRepository.js";

export default class VendorDashboardService {
    constructor() {
        this.vendorDashboardRepository = new VendorDashboardRepository();
    }

    async getDashboardData(vendorId, period = 'monthly') {
        const [summary, salesActivity, topProducts, topBrands] = await Promise.all([
            this.vendorDashboardRepository.getSummaryStats(vendorId),
            this.vendorDashboardRepository.getSalesActivity(vendorId, period),
            this.vendorDashboardRepository.getTopSellingProducts(vendorId, 10),
            this.vendorDashboardRepository.getTopSellingBrands(vendorId, 10)
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
            topBrands,
            currentPeriod: period
        };
    }
}
