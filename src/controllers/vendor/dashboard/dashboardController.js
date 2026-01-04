module.exports = class DashboardController {
    // constructor(dashboardService) {
    //     this.dashboardService
    // }

    rendorDashboardPage(req,res){
        return res.render("vendor/dashboard",{
            totalCustomers: 1200,
            totalOrders: 826,
            totalSales: 2313000,
            totalPending: 54,
            totalEarnings: 2013000,
            activityData: [
                { day: "Mon", value: 18 },
                { day: "Tue", value: 27 },
                { day: "Wed", value: 12 },
                { day: "Thu", value: 36 },
                { day: "Fri", value: 30 },
                { day: "Sat", value: 20 },
                { day: "Sun", value: 33 }
            ],
            range: "Week"
        })
    }
}