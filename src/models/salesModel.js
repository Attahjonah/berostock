const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const saleSchema = new mongoose.Schema({
  sale_id: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    required: true
  },
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      }
    }
  ],
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer_name: {
    type: String,
    default: 'Walk-in Customer'
  },
  total_price: {
    type: Number,
    required: true,
    min: [0, 'Total price must be a non-negative number']
  },
  profit_made: {
    type: Number,
    required: true,
    min: [0, 'Profit must be a non-negative number']
  },
  mode_of_payment: {
    type: String,
    required: true,
    enum: ['POS', 'Transfer', 'Cash']
  }
}, {
  timestamps: { createdAt: 'date_of_sale', updatedAt: 'updated_at' }
});

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
