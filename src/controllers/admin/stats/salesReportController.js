import SalesReportService from "../../../service/admin/stats/salesReportService.js";

export default class SalesReportController {
    constructor() {
        this.salesReportService = new SalesReportService();
    }

    async renderSalesReportPage(req, res) {
        try {
            const { filterType = 'monthly', startDate, endDate } = req.query;
            const { report, startDate: start, endDate: end } = await this.salesReportService.getSalesReport(filterType, startDate, endDate);


            const salesData = report.map(item => ({
                date: item.date,
                orderId: item.orderId,
                paymentMethod: item.paymentMethod,
                gross: item.gross.toFixed(2),
                discount: item.discount.toFixed(2),
                net: item.net.toFixed(2)
            }));

            const totalOrders = report.length;
            const totalGross = report.reduce((sum, item) => sum + item.gross, 0);
            const totalDiscount = report.reduce((sum, item) => sum + item.discount, 0);
            const totalNet = report.reduce((sum, item) => sum + item.net, 0);


            const deliveryCharges = totalOrders * 40;
            const taxCollected = 0;

            // Render the view with data
            res.render("admin/stats/salesReport", {
                user: req.user,
                salesDatas: salesData,
                filterType,
                startDate: start,
                endDate: end,
                totalOrders,
                grossRevenue: totalGross.toFixed(2),
                totalDiscount: totalDiscount.toFixed(2),
                netRevenue: totalNet.toFixed(2),
                avgOrderValue: totalOrders > 0 ? (totalNet / totalOrders).toFixed(2) : '0.00',
                totalCustomers: 0,
                taxCollected: taxCollected.toFixed(2),
                deliveryCharges: deliveryCharges.toFixed(2),
                couponDiscounts: '0.00',
                offerDiscounts: totalDiscount.toFixed(2)
            });

        } catch (error) {
            console.log("Error loading sales report page:", error);
            res.status(500).render("error", { message: "Failed to load sales report" });
        }
    }

    async downloadSalesReport(req, res) {
        try {
            const { format, filterType, startDate, endDate } = req.query;
            const { report, startDate: start, endDate: end } = await this.salesReportService.getSalesReport(filterType, startDate, endDate);

            if (format === 'pdf') {
                const pdfBuffer = await this.salesReportService.generatePDF(report, start, end);

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=sales-report-${filterType}.pdf`);
                res.send(pdfBuffer);

            } else if (format === 'excel') {
                const excelBuffer = await this.salesReportService.generateExcel(report, start, end);

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=sales-report-${filterType}.xlsx`);
                res.send(excelBuffer);

            } else {
                res.status(400).send("Invalid format");
            }

        } catch (error) {
            console.log("Error downloading sales report:", error);
            res.status(500).send("Failed to download report");
        }
    }
}