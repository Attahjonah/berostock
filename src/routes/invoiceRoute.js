const express = require('express');
const router = express.Router();
const { getInvoiceById } = require('../controllers/invoiceController');

router.get('/:id', getInvoiceById);

module.exports = router;
