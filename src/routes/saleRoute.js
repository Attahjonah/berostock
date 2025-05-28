const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware')
const { saleRateLimiter } = require('../middlewares/rateLimiter');


router.use(authMiddleware);
router.use(saleRateLimiter); // Apply rate limit to all sale routes



/**
 * @swagger
 * /api/sales/export:
 *   get:
 *     summary: Export sales to CSV
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV export
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Server error
 */

router.get('/export', authMiddleware, saleController.exportSalesToCSV);



/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *               - mode_of_payment
 *             properties:
 *               product_id:
 *                 type: string
 *                 example: abc123-uuid
 *               quantity:
 *                 type: number
 *                 example: 2
 *               mode_of_payment:
 *                 type: string
 *                 enum: [POS, Transfer, Cash]
 *                 example: POS
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

router.post('/', saleController.createSale);



/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales with filters
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         example: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         example: 10
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         example: rice
 *       - name: product_id
 *         in: query
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         schema:
 *           type: string
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: A list of sales
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

router.get('/', saleController.getAllSales);


/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get a sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Sale ID or sale_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale details
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */

router.get('/:id', authorizeRoles("admin", "manager", "staff"), saleController.getSaleById);



/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Sale ID or sale_id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Sale updated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */

router.put('/:id', saleController.updateSale);




/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete a sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Sale ID or sale_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale deleted
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Server error
 */

router.delete('/:id', saleController.deleteSale);




module.exports = router;
