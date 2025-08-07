const express = require('express');
const router = express.Router();
const { getInvoiceById } = require('../controllers/invoiceController');


/**
 * @swagger
 * /invoice/{id}:
 *   get:
 *     summary: Get a sales invoice PDF by sale ID or UUID
 *     tags: [Invoice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The MongoDB `_id` or `sale_id` (UUID) of the sale
 *         schema:
 *           type: string
 *           example: "2f5a188f-45f1-43a4-a207-4e9c06b99a2f"
 *     responses:
 *       200:
 *         description: Returns the invoice as a PDF file stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid or missing sale ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid sale ID"
 *       404:
 *         description: Sale not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sale not found"
 *       500:
 *         description: Internal server error
 */

router.get('/:id', getInvoiceById);

module.exports = router;
