import SalesReportRepository from "../../../repository/admin/salesReportRepository.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

export default class SalesReportService {
    constructor() {
        this.salesReportRepository = new SalesReportRepository();
    }

    async getSalesReport(filterType, customStartDate, customEndDate) {
        let startDate, endDate;
        const now = new Date();

        switch (filterType) {
            case 'daily':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'weekly':
                const firstDayOfWeek = now.getDate() - now.getDay();
                startDate = new Date(now.setDate(firstDayOfWeek));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now.getFullYear(), 11, 31);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'custom':
                if (!customStartDate || !customEndDate) {
                    throw new Error("Start date and end date are required for custom filter");
                }
                startDate = new Date(customStartDate);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(customEndDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
        }

        const report = await this.salesReportRepository.getSalesReport(startDate, endDate);
        return { report, startDate, endDate, filterType };
    }

    async generatePDF(reportData, startDate, endDate) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Title
            doc.fontSize(20).text('Sales Report', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).text(`Period: ${startDate.toDateString()} - ${endDate.toDateString()}`, { align: 'center' });
            doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown();

            // Table Header
            const tableTop = 150;
            const col1 = 50;  // Date
            const col2 = 120; // Order ID
            const col3 = 240; // Payment
            const col4 = 320; // Gross
            const col5 = 400; // Discount
            const col6 = 480; // Net

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Date', col1, tableTop);
            doc.text('Order ID', col2, tableTop);
            doc.text('Payment', col3, tableTop);
            doc.text('Gross', col4, tableTop);
            doc.text('Discount', col5, tableTop);
            doc.text('Net Sales', col6, tableTop);

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Table Content
            let y = tableTop + 25;
            doc.font('Helvetica');

            let totalGross = 0;
            let totalDiscount = 0;
            let totalNet = 0;

            reportData.forEach(item => {
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }

                doc.fontSize(8);
                doc.text(item.date, col1, y);
                doc.text(item.orderId.toString().substring(0, 4), col2, y);
                doc.text(item.paymentMethod, col3, y);
                doc.text(item.gross.toFixed(2), col4, y);
                doc.text(item.discount.toFixed(2), col5, y);
                doc.text(item.net.toFixed(2), col6, y);

                totalGross += item.gross;
                totalDiscount += item.discount;
                totalNet += item.net;

                y += 20;
            });

            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;

            // Total Row
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Total', col1, y);
            doc.text(reportData.length.toString() + " orders", col2, y);
            doc.text('', col3, y);
            doc.text(totalGross.toFixed(2), col4, y);
            doc.text(totalDiscount.toFixed(2), col5, y);
            doc.text(totalNet.toFixed(2), col6, y);

            y += 50;
            if (y > 650) {
                doc.addPage();
                y = 50;
            }

            // Detailed Summary Section
            doc.fontSize(16).text('Report Summary', col1, y);
            doc.moveTo(col1, y + 18).lineTo(200, y + 18).stroke();
            y += 30;

            doc.fontSize(12).font('Helvetica');
            const summaryData = [
                { label: 'Total Orders:', value: reportData.length.toString() },
                { label: 'Gross Revenue:', value: totalGross.toFixed(2) },
                { label: 'Total Discounts:', value: totalDiscount.toFixed(2) },
                { label: 'Net Revenue:', value: totalNet.toFixed(2) },
                { label: 'Average Order Value:', value: reportData.length > 0 ? (totalNet / reportData.length).toFixed(2) : '0.00' }
            ];

            summaryData.forEach(item => {
                doc.font('Helvetica-Bold').text(item.label, col1, y);
                doc.font('Helvetica').text(item.value, col1 + 150, y);
                y += 20;
            });

            doc.end();
        });
    }

    async generateExcel(reportData, startDate, endDate) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Header Style
        const headerStyle = {
            font: { bold: true, size: 12 },
            alignment: { horizontal: 'center' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };

        // Add Title and Period
        worksheet.mergeCells('A1:E1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'Sales Report';
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells('A2:E2');
        const periodCell = worksheet.getCell('A2');
        periodCell.value = `Period: ${startDate.toDateString()} - ${endDate.toDateString()}`;
        periodCell.alignment = { horizontal: 'center' };

        worksheet.mergeCells('A3:E3');
        const genCell = worksheet.getCell('A3');
        genCell.value = `Generated on: ${new Date().toLocaleString()}`;
        genCell.alignment = { horizontal: 'center' };

        worksheet.addRow([]); // Empty row

        // Table Header
        const headerRow = worksheet.addRow(['Date', 'Order ID', 'Payment', 'Gross Sales', 'Discount', 'Net Sales']);
        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // Set column widths
        worksheet.columns = [
            { width: 15 }, // Date
            { width: 30 }, // Order ID
            { width: 15 }, // Payment
            { width: 15 }, // Gross
            { width: 15 }, // Discount
            { width: 15 }  // Net
        ];

        let totalGross = 0;
        let totalDiscount = 0;
        let totalNet = 0;

        // Content rows
        reportData.forEach(item => {
            worksheet.addRow([
                item.date,
                item.orderId.toString().substring(0, 4),
                item.paymentMethod,
                item.gross,
                item.discount,
                item.net
            ]);

            totalGross += item.gross;
            totalDiscount += item.discount;
            totalNet += item.net;
        });

        // Total row
        const totalRow = worksheet.addRow([
            'Total',
            reportData.length + ' orders',
            '',
            totalGross,
            totalDiscount,
            totalNet
        ]);
        totalRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.border = { top: { style: 'thin' } };
        });

        worksheet.addRow([]); // Empty row
        worksheet.addRow([]); // Empty row

        // Summary Title
        worksheet.addRow(['Report Summary']).font = { bold: true, size: 14 };
        worksheet.addRow(['Total Orders', reportData.length]);
        worksheet.addRow(['Gross Revenue', totalGross]);
        worksheet.addRow(['Total Discounts', totalDiscount]);
        worksheet.addRow(['Net Revenue', totalNet]);
        worksheet.addRow(['Average Order Value', reportData.length > 0 ? (totalNet / reportData.length) : 0]);

        // Format numbers
        worksheet.getColumn(4).numFmt = '₹#,##0.00';
        worksheet.getColumn(5).numFmt = '₹#,##0.00';
        worksheet.getColumn(6).numFmt = '₹#,##0.00';

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }
}
