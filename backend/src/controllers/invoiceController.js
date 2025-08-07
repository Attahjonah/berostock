const mongoose = require('mongoose');
const Sale = require('../models/salesModel'); 
const  generateInvoicePdf  = require('../utils/generateInvoiceUtils'); 

exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = {
      $or: [
        { sale_id: id },
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null
      ].filter(Boolean)
    };

    const sale = await Sale.findOne(query).populate('products.product_id');
    if (!sale) {
      return res.status(404).send('Invoice not found');
    }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=invoice-${sale.sale_id}.pdf`);
        await generateInvoicePdf(sale, res);
    

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).send('Internal server error');
  }
};
