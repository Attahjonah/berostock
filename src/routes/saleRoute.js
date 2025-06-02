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
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Sale creation payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - mode_of_payment
 *             properties:
 *               products:
 *                 type: array
 *                 description: List of products sold in this sale
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       description: ObjectId or UUID of the product
 *                       example: 60d21b4667d0d8992e610c85
 *                     quantity:
 *                       type: integer
 *                       description: Quantity sold (must be > 0)
 *                       example: 3
 *               mode_of_payment:
 *                 type: string
 *                 enum: [POS, Transfer, Cash]
 *                 example: POS
 *               customer_name:
 *                 type: string
 *                 description: Name of the customer (optional)
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: PDF invoice generated inline
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

router.post('/', saleController.createSale);



/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales with filters and pagination
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 20
 *         description: Max items per page (max 20)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         description: Filter sales by product ID (Mongo _id or UUID)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter sales by user ID (Mongo _id)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sales up to this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of sales with metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pages:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sale_id:
 *                         type: string
 *                         description: UUID of the sale
 *                       sold_by:
 *                         type: string
 *                         description: Name of the user who made the sale
 *                       customer_name:
 *                         type: string
 *                       products:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             product_id:
 *                               type: string
 *                             product_name:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             selling_price:
 *                               type: number
 *                               format: float
 *                             cost_price:
 *                               type: number
 *                               format: float
 *                             profit_made:
 *                               type: number
 *                               format: float
 *                       total_price:
 *                         type: number
 *                         format: float
 *                       profit_made:
 *                         type: number
 *                         format: float
 *                       mode_of_payment:
 *                         type: string
 *                       date_of_sale:
 *                         type: string
 *                         format: date
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 totalSales:
 *                   type: number
 *                   format: float
 *                 totalProfit:
 *                   type: number
 *                   format: float
 *                   nullable: true
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

router.get('/', saleController.getAllSales);


/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID (Mongo _id or UUID)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Sale ID (Mongo _id or sale UUID)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sale_id:
 *                       type: string
 *                     sold_by:
 *                       type: string
 *                     customer_name:
 *                       type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product_id:
 *                             type: string
 *                           product_name:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           selling_price:
 *                             type: number
 *                             format: float
 *                           cost_price:
 *                             type: number
 *                             format: float
 *                           profit_made:
 *                             type: number
 *                             format: float
 *                     total_price:
 *                       type: number
 *                       format: float
 *                     profit_made:
 *                       type: number
 *                       format: float
 *                     mode_of_payment:
 *                       type: string
 *                     date_of_sale:
 *                       type: string
 *                       format: date
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Internal server error
 */

router.get('/:id', authorizeRoles("admin", "manager", "staff"), saleController.getSaleById);



/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update a sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Sale ID (Mongo _id or sale UUID)
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Sale update payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               customer_name:
 *                 type: string
 *                 example: Jane Smith
 *               mode_of_payment:
 *                 type: string
 *                 enum: [POS, Transfer, Cash]
 *     responses:
 *       200:
 *         description: PDF invoice generated as attachment
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request (validation errors)
 *       403:
 *         description: Unauthorized to update this sale
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', saleController.updateSale);




/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete a sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Sale ID (Mongo _id or sale UUID)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Sale deleted successfully
 *       403:
 *         description: Unauthorized to delete this sale
 *       404:
 *         description: Sale not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', saleController.deleteSale);


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
router.get('/export', saleController.exportSalesToCSV);



module.exports = router;
