const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middlewares/authMiddleware'); 

router.use(authenticate)


/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Sales report generation in PDF
 */

/**
 * @swagger
 * /api/report/daily:
 *   get:
 *     summary: Generate and download the Daily Sales Report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Daily Sales Report PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Failed to generate report
 */
router.get('/daily', reportController.getDailyReportPDF);

/**
 * @swagger
 * /api/report/weekly:
 *   get:
 *     summary: Generate and download the Weekly Sales Report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Weekly Sales Report PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Failed to generate report
 */
router.get('/weekly', reportController.getWeeklyReportPDF);

/**
 * @swagger
 * /api/report/monthly:
 *   get:
 *     summary: Generate and download the Monthly Sales Report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Monthly Sales Report PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Failed to generate report
 */
router.get('/monthly', reportController.getMonthlyReportPDF);

/**
 * @swagger
 * /api/report/yearly:
 *   get:
 *     summary: Generate and download the Yearly Sales Report
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Yearly Sales Report PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Failed to generate report
 */
router.get('/yearly', reportController.getYearlyReportPDF);

/**
 * @swagger
 * /api/report/custom:
 *   get:
 *     summary: Generate and download a Custom Sales Report
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Custom Sales Report PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing or invalid date parameters
 *       500:
 *         description: Failed to generate report
 */
router.get('/custom', reportController.getCustomReportPDF);

module.exports = router;
