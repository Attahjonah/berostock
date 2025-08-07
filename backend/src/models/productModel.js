const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid")

const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    default: () => uuidv4(),
    unique: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity must be a non-negative number']
  },
  cost_price: {
    type: Number,
    required: true,
    min: [0, 'Cost price must be a non-negative number']
  },
  selling_price: {
    type: Number,
    min: [0, 'Selling price must be a non-negative number']
  },
  image_url: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
   supplier: { 
    type: String, 
    required: true,
    enum: ["Fouani", "Somotex", "Guangzhou China"]
        
     },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Automatically calculate 20% profit margin on save
productSchema.pre('save', function (next) {
  if (this.isModified('cost_price') || this.selling_price === undefined) {
    this.selling_price = +(this.cost_price * 1.2).toFixed(2);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;