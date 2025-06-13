const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const axios = require('axios');
const writtenNumber = require('written-number');
writtenNumber.defaults.lang = 'en';
const moment = require('moment');

const Product = require('../models/productModel');
const Sale = require('../models/salesModel');

const COMPANY = {
  name: 'Bennyrose Nigeria Ltd.',
  address: 'Bennyrose Avenue, Near AMAC Market FHA Phase 2, Lugbe, Abuja',
  phone: '+234703276847, +2348023151901',
  email: 'bennyrosehotel@yahoo.com',
  logoUrl: 'https://res.cloudinary.com/dfcbhd3oo/image/upload/v1748471990/benyrose_logo_ro38vw.jpg'
};

module.exports = async function generateInvoicePdf(sale, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.on('error', err => {
    console.error('❌ PDF generation error:', err);
    if (!res.headersSent) {
      res.status(500).end('PDF generation failed');
    }
  });

  doc.pipe(res);

  await sale.populate('products.product_id');

  // Logo
  try {
    const logo = await axios.get(COMPANY.logoUrl, { responseType: 'arraybuffer' });
    doc.image(logo.data, 50, 40, { width: 80 });
  } catch (e) {
    console.warn('⚠️ Failed to load logo:', e.message);
  }

  // Company Info
  doc
    .fontSize(14).text(COMPANY.name, 150, 40)
    .fontSize(10).text(COMPANY.address, 150, 60)
    .text(`Phone: ${COMPANY.phone}`, 150, 75)
    .text(`Email: ${COMPANY.email}`, 150, 90);

  const yStart = 130;
  doc
    .fontSize(12).text(`Invoice #: ${sale.sale_id}`, 50, yStart)
    .text(`Delivery Date: ${moment(sale.date_of_sale).format('DD MMM YYYY, h:mm A')}`, 50, yStart + 20)
    .text(`Mode of Payment: ${sale.mode_of_payment}`, 50, yStart + 40)
    .text(`Customer: ${sale.customer_name}`, 50, yStart + 60);

  // Table headers
  const tableTop = yStart + 100;
  const rowHeight = 25;
  let y = tableTop;

  doc
    .font('Helvetica-Bold').fontSize(10)
    .text('Product', 50, y, { width: 100 })
    .text('Description', 150, y, { width: 160 })
    .text('Qty', 310, y, { width: 40, align: 'right' })
    .text('Rate', 360, y, { width: 70, align: 'right' })
    .text('Amount', 450, y, { width: 80, align: 'right' })
    .moveTo(50, y + 15).lineTo(550, y + 15).stroke();

  y += rowHeight;

  // Table rows
  doc.font('Helvetica').fontSize(9);
  for (const item of sale.products) {
    const prod = item.product_id;
    const amount = prod.selling_price * item.quantity;

    doc
      .text(prod.name, 50, y, { width: 100 })
      .text(prod.description || '-', 150, y, { width: 160, lineBreak: true })
      .text(item.quantity.toString(), 310, y, { width: 40, align: 'right' })
      .text(` ${prod.selling_price.toLocaleString()}`, 360, y, { width: 70, align: 'right' })
      .text(` ${amount.toLocaleString()}`, 450, y, { width: 80, align: 'right' });

    y += rowHeight;
  }

  // Total & amount in words
  y += 10;
  doc.font('Helvetica-Bold')
    .text('TOTAL:', 360, y)
    .text(`NGN ${sale.total_price.toLocaleString()}`, 450, y);

  y += rowHeight;

  const amountWords = writtenNumber(sale.total_price)
    .replace(/ hundred (?=[a-z])/i, ' hundred and ');

  doc.font('Helvetica').fontSize(10)
    .text(`Amount in words: ${amountWords} naira only`, 50, y);

  // QR Code
  const qrY = y + 40;
  //const invoiceUrl = `https://localhost:2025.com/invoice/${sale.sale_id}`;
  const invoiceUrl = `https://berostock.onrender.com/invoice/${sale.sale_id}`;
  const qrBuffer = await QRCode.toBuffer(invoiceUrl);

  doc.image(qrBuffer, 50, qrY, { width: 80 });

  // Note section (below QR)
  y = qrY + 90;
  doc
    .font('Helvetica-Oblique')
    .fontSize(9)
    .fillColor('gray')
    .text('Note: Goods once sold are not returnable. Thank you for your patronage.', 50, y, {
      width: 500,
      align: 'left'
    })
    .fillColor('black');

  // Signatures
  y += 30;
  doc
    .font('Helvetica').fontSize(10)
    .text('_________________________', 50, y)
    .text('Company Signature', 60, y + 15)
    .text('_________________________', 350, y)
    .text('Customer Signature', 360, y + 15);

  doc.end();
};
