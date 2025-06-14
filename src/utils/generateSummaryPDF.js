const PDFDocument = require('pdfkit');
const moment = require('moment');
const axios = require('axios');
const writtenNumber = require('written-number');
writtenNumber.defaults.lang = 'en';

const COMPANY = {
  name: 'Bennyrose Nigeria Ltd.',
  address: 'Bennyrose Avenue, Near AMAC Market FHA Phase 2, Lugbe, Abuja',
  phone: '+234703276847, +2348023151901',
  email: 'bennyrosehotel@yahoo.com',
  logoUrl: 'https://res.cloudinary.com/dfcbhd3oo/image/upload/v1748471990/benyrose_logo_ro38vw.jpg'
};

module.exports = async function generateSummaryPDF(sales, title, startDate, endDate, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.on('error', err => {
    console.error('❌ PDF generation error:', err);
    if (!res.headersSent) res.status(500).end('PDF generation failed');
  });

  doc.pipe(res);

  // Header: Logo + Company Info
  try {
    const logo = await axios.get(COMPANY.logoUrl, { responseType: 'arraybuffer' });
    doc.image(logo.data, 50, 40, { width: 80 });
  } catch (e) {
    console.warn('⚠️ Failed to load logo:', e.message);
  }

  doc
    .fontSize(14).text(COMPANY.name, 150, 40)
    .fontSize(10).text(COMPANY.address, 150, 60)
    .text(`Phone: ${COMPANY.phone}`, 150, 75)
    .text(`Email: ${COMPANY.email}`, 150, 90);

  doc
    .fontSize(16).text(title, 50, 130)
    .fontSize(10).text(`Period: ${startDate.format('DD MMM YYYY')} - ${endDate.format('DD MMM YYYY')}`, 50, 150);

  let totalSales = 0;
  let totalProfit = 0;
  let y = 180;

  // Table header
  doc
    .font('Helvetica-Bold').fontSize(10)
    .text('Date', 50, y)
    .text('Products Sold', 110, y)
    .text('Amount (NGN)', 350, y, { width: 90, align: 'right' })
    .text('Profit (NGN)', 450, y, { width: 90, align: 'right' })
    .moveTo(50, y + 15).lineTo(550, y + 15).stroke();

  y += 25;
  doc.font('Helvetica').fontSize(9);

  for (const sale of sales) {
    const date = moment(sale.date_of_sale).format('DD MMM');
    const productNames = sale.products.map(p => p.product_id?.name || 'N/A').join(', ');
    const amount = parseFloat(sale.total_price) || 0;
    const profit = parseFloat(sale.profit_made) || 0;

    // Debug: Uncomment to inspect raw values
    // console.log(`🧾 Sale: ${sale.sale_id}, Total: ${amount}, Profit: ${profit}`);

    totalSales += amount;
    totalProfit += profit;

    doc
      .text(date, 50, y)
      .text(productNames, 110, y, { width: 220 })
      .text(`${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 350, y, { width: 90, align: 'right' })
      .text(`${profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 450, y, { width: 90, align: 'right' });

    y += 20;

    if (y > 720) {
      doc.addPage();
      y = 50;
    }
  }

  y += 10;
  doc.font('Helvetica-Bold')
    .text('Total Sales:', 350, y, { width: 90, align: 'right' })
    .text(`${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 450, y, { width: 90, align: 'right' });

  y += 20;
  doc
    .text('Total Profit:', 350, y, { width: 90, align: 'right' })
    .text(`${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 450, y, { width: 90, align: 'right' });

  y += 30;

//   const amountWords = writtenNumber(Math.floor(totalSales)).replace(/ hundred (?=[a-z])/i, ' hundred and ');
//   doc.font('Helvetica').fontSize(9)
//     .text(`Amount in words: ${amountWords} naira only`, 50, y);

  doc.end();
};
