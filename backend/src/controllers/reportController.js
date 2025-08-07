const moment = require('moment');
const Sale = require('../models/salesModel');
const generateSummaryPDF = require('../utils/generateSummaryPDF');

// Utility function
const getReport = async (req, res, title, startDate, endDate) => {
  try {
    const sales = await Sale.find({
      date_of_sale: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate()
      }
    })
    .populate('products.product_id')
    .lean();

    await generateSummaryPDF(sales, `${title} Sales Summary`, startDate, endDate, res,  req.user?.role);
  } catch (err) {
    console.error('❌ Error generating summary PDF:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate summary PDF' });
    }
  }
};

// Daily Report
exports.getDailyReportPDF = (req, res) => {
  const today = moment().startOf('day');
  const endOfDay = moment().endOf('day');
  getReport(req, res, 'Daily', today, endOfDay);
};

// Weekly Report
exports.getWeeklyReportPDF = (req, res) => {
  const startOfWeek = moment().startOf('week');
  const endOfWeek = moment().endOf('week');
  getReport(req, res, 'Weekly', startOfWeek, endOfWeek);
};

// Monthly Report
exports.getMonthlyReportPDF = (req, res) => {
  const startOfMonth = moment().startOf('month');
  const endOfMonth = moment().endOf('month');
  getReport(req, res, 'Monthly', startOfMonth, endOfMonth);
};

// Yearly Report
exports.getYearlyReportPDF = (req, res) => {
  const startOfYear = moment().startOf('year');
  const endOfYear = moment().endOf('year');
  getReport(req, res, 'Yearly', startOfYear, endOfYear);
};

// Custom Date Range Report
exports.getCustomReportPDF = (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'Please provide both start and end date in the query' });
  }

  const startDate = moment(start, 'YYYY-MM-DD', true);
  const endDate = moment(end, 'YYYY-MM-DD', true);

  if (!startDate.isValid() || !endDate.isValid()) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  getReport(req, res, 'Custom', startDate.startOf('day'), endDate.endOf('day'));
};
