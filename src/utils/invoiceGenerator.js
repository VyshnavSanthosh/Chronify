import PDFDocument from 'pdfkit';

export const generateInvoice = (order, user) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Add content to the PDF
            generateHeader(doc);
            generateCustomerInformation(doc, order, user);
            generateInvoiceTable(doc, order);
            generateFooter(doc);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

function generateHeader(doc) {
    doc.fillColor('#444444')
        .fontSize(20)
        .text('CHRONIFY', 50, 57)
        .fontSize(10)
        .text('CHRONIFY', 200, 50, { align: 'right' })
        .text('123 Street Name', 200, 65, { align: 'right' })
        .text('City, State, 12345', 200, 80, { align: 'right' })
        .moveDown();
}

function generateCustomerInformation(doc, order, user) {
    doc.fillColor('#444444')
        .fontSize(20)
        .text('Invoice', 50, 160);

    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc.fontSize(10)
        .text('Order ID:', 50, customerInformationTop)
        .font('Helvetica-Bold')
        .text(order._id.toString().slice(-6).toUpperCase(), 150, customerInformationTop)
        .font('Helvetica')
        .text('Order Date:', 50, customerInformationTop + 15)
        .text(new Date(order.createdAt).toLocaleDateString(), 150, customerInformationTop + 15)
        .text('Order Status:', 50, customerInformationTop + 30)
        .text(order.orderStatus.replace(/_/g, ' ').toUpperCase(), 150, customerInformationTop + 30)
        .text('Total Amount:', 50, customerInformationTop + 45)
        .text(`Rs. ${order.total.toFixed(1)}`, 150, customerInformationTop + 45)

        .font('Helvetica-Bold')
        .text(order.address.name, 300, customerInformationTop)
        .font('Helvetica')
        .text(order.address.address, 300, customerInformationTop + 15)
        .text(
            `${order.address.district}, ${order.address.state}, ${order.address.pinCode}`,
            300,
            customerInformationTop + 30
        )
        .moveDown();

    generateHr(doc, 270);
}

function generateInvoiceTable(doc, order) {
    let i;
    const invoiceTableTop = 330;

    doc.font('Helvetica-Bold');
    generateTableRow(
        doc,
        invoiceTableTop,
        'Item',
        'Unit Cost',
        'Quantity',
        'Discount (%)',
        'Total'
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font('Helvetica');

    for (i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const position = invoiceTableTop + (i + 1) * 30;

        const lineTotal = (item.price * item.quantity) - ((item.price * item.quantity * (item.offer || 0)) / 100);

        generateTableRow(
            doc,
            position,
            item.name,
            `Rs. ${item.price.toFixed(1)}`,
            item.quantity,
            `${item.offer || 0}%`,
            `Rs. ${lineTotal.toFixed(1)}`
        );

        generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
        doc,
        subtotalPosition,
        '',
        '',
        'Subtotal',
        '',
        `Rs. ${order.total.toFixed(1)}`
    );

    const paidToDatePosition = subtotalPosition + 20;
    generateTableRow(
        doc,
        paidToDatePosition,
        '',
        '',
        'Payment Method',
        '',
        order.paymentMethod.toUpperCase()
    );

    const duePosition = paidToDatePosition + 25;
    doc.font('Helvetica-Bold');
    generateTableRow(
        doc,
        duePosition,
        '',
        '',
        'Grand Total',
        '',
        `Rs. ${order.total.toFixed(1)}`
    );
    doc.font('Helvetica');
}

function generateFooter(doc) {
    doc.fontSize(10)
        .text(
            'Payment is due within 15 days. Thank you for your business.',
            50,
            780,
            { align: 'center', width: 500 }
        );
}

function generateTableRow(
    doc,
    y,
    item,
    unitCost,
    quantity,
    offer,
    lineTotal
) {
    doc.fontSize(10)
        .text(item, 50, y, { width: 200 })
        .text(unitCost, 250, y, { width: 80, align: 'right' })
        .text(quantity.toString(), 330, y, { width: 60, align: 'right' })
        .text(offer, 390, y, { width: 80, align: 'right' })
        .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc, y) {
    doc.strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}
