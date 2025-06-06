const mongoose = require('mongoose')
const { Parser } = require('json2csv');
const Sale = require('../models/salesModel');
const Product = require('../models/productModel');
const User = require('../models/userModel')
const { v4: uuidv4 } = require('uuid');

const generateInvoicePdf = require('../utils/generateInvoiceUtils'); 

exports.createSale = async (req, res) => {
  try {
    const { products, mode_of_payment, customer_name = 'Walk-in Customer' } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required' });
    }

    // Check for duplicate product_ids
    const productIds = products.map(p => p.product_id);
    const uniqueIds = new Set(productIds.map(id => id.toString()));
    if (productIds.length !== uniqueIds.size) {
      return res.status(400).json({ message: 'Duplicate products are not allowed in a sale' });
    }


    if (!['POS', 'Transfer', 'Cash'].includes(mode_of_payment)) {
      return res.status(400).json({ message: 'Invalid mode of payment' });
    }

    let total_price = 0;
    let total_profit = 0;
    const saleProducts = [];

    for (const item of products) {
      const { product_id, quantity } = item;

      if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than 0' });
      }

      let product = null;
      if (mongoose.Types.ObjectId.isValid(product_id)) {
        product = await Product.findById(product_id);
      }
      if (!product) {
        product = await Product.findOne({ product_id });
      }

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${product_id}` });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      product.quantity -= quantity;
      await product.save();

      const amount = +(product.selling_price * quantity).toFixed(2);
      const profit = +((product.selling_price - product.cost_price) * quantity).toFixed(2);

      total_price += amount;
      total_profit += profit;

      saleProducts.push({ product_id: product._id, quantity });
    }

    const sale = await Sale.create({
      user_id: req.user._id,
      products: saleProducts,
      customer_name,
      total_price: +total_price.toFixed(2),
      profit_made: +total_profit.toFixed(2),
      mode_of_payment
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=invoice.pdf');

    await generateInvoicePdf(sale, res);
  } catch (error) {
    console.error("❌ Create sale error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};


exports.getAllSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      product_id,
      userId,
      startDate,
      endDate,
    } = req.query;

    const skip = (page - 1) * limit;
    const { role: userRole } = req.user;

    if (limit > 20) {
      return res.status(400).json({ error: 'Limit cannot be more than 20' });
    }

    const query = {};

    // ✅ Filter by product_id or UUID
    if (product_id) {
      if (mongoose.Types.ObjectId.isValid(product_id)) {
        query['products.product_id'] = new mongoose.Types.ObjectId(product_id);
      } else {
        const product = await Product.findOne({ product_id });
        if (product) {
          query['products.product_id'] = product._id;
        } else {
          return res.status(404).json({ error: 'Product not found' });
        }
      }
    }

    // ✅ Search by product name
    if (search) {
      const productIds = await Product.find({
        name: { $regex: search, $options: 'i' },
      }).distinct('_id');
      query['products.product_id'] = { $in: productIds };
    }

    // ✅ Filter by user
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query.user_id = userId;
      } else {
        return res.status(400).json({ error: 'Invalid userId format' });
      }
    }

    // ✅ Date range filter
    if (startDate || endDate) {
      query.date_of_sale = {};
      if (startDate) query.date_of_sale.$gte = new Date(startDate);
      if (endDate) query.date_of_sale.$lte = new Date(endDate);
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date_of_sale: -1 })
      .populate('user_id', 'firstName lastName')
      .populate('products.product_id', 'product_id name');

    const totalSales = sales.reduce((acc, sale) => acc + sale.total_price, 0);
    const totalProfit = ['admin', 'manager'].includes(userRole)
      ? sales.reduce((acc, sale) => acc + sale.profit_made, 0)
      : undefined;

    const responseSales = sales.map((sale) => {
      const saleObj = sale.toObject();

      saleObj.date_of_sale = saleObj.date_of_sale instanceof Date
        ? saleObj.date_of_sale.toISOString().split('T')[0]
        : 'Unknown';

      saleObj.sale_id = sale.sale_id;
      saleObj.sold_by = sale.user_id
        ? `${sale.user_id.firstName} ${sale.user_id.lastName}`
        : 'Unknown';

      // Extract product details
      saleObj.products = sale.products.map(p => ({
        product_id: p.product_id?.product_id || p.product_id?._id || 'Unknown',
        product_name: p.product_id?.name || 'Unknown',
        quantity: p.quantity
      }));

      if (!['admin', 'manager'].includes(userRole)) {
        delete saleObj.profit_made;
      }

      delete saleObj.user_id;
      return saleObj;
    });

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: responseSales,
      totalSales,
      ...(totalProfit !== undefined && { totalProfit }),
    });
  } catch (err) {
    console.error('❌ Error fetching sales:', err.message);
    return res.status(500).json({ error: 'Server error while fetching sales' });
  }
};


exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role: userRole } = req.user;

    const orConditions = [];

    // Match by Mongo _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }

    // Match by sale UUID
    orConditions.push({ sale_id: id });

    // Match by product_id (UUID string) inside products array
    const product = mongoose.Types.ObjectId.isValid(id)
      ? await Product.findById(id)
      : await Product.findOne({ product_id: id });

    if (product) {
      orConditions.push({ 'products.product_id': product._id });
    }

    const query = { $or: orConditions };

    const sale = await Sale.findOne(query)
      .populate('user_id', 'firstName lastName')
      .populate('products.product_id', 'product_id name cost_price selling_price');

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const saleObj = sale.toObject();

    // Format user
    saleObj.sold_by = sale.user_id
      ? `${sale.user_id.firstName} ${sale.user_id.lastName}`
      : 'Unknown';

    // Format product info
    saleObj.products = sale.products.map((p) => ({
      product_id: p.product_id?.product_id || p.product_id?._id || 'Unknown',
      product_name: p.product_id?.name || 'Unknown',
      quantity: p.quantity,
      selling_price: p.product_id?.selling_price || 0,
      ...(userRole === 'admin' || userRole === 'manager' ? {
        cost_price: p.product_id?.cost_price || 0,
        profit_made: ((p.product_id?.selling_price || 0) - (p.product_id?.cost_price || 0)) * p.quantity
      } : {})
    }));

    if (!['admin', 'manager'].includes(userRole)) {
      delete saleObj.profit_made;
    }

    delete saleObj.user_id;

    return res.status(200).json({ success: true, data: saleObj });
  } catch (error) {
    console.error('❌ Error fetching sale by ID:', error);
    return res.status(500).json({ error: 'Server error while fetching sale' });
  }
};


exports.updateSale = async (req, res) => {
  try {
    const user_id = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;
    const { products, customer_name, mode_of_payment } = req.body;

    const allowedPayments = ['POS', 'Transfer', 'Cash'];
    if (mode_of_payment && !allowedPayments.includes(mode_of_payment)) {
      return res.status(400).json({ message: 'Invalid mode of payment' });
    }

    const query = {
      $or: [
        { sale_id: id },
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
      ].filter(Boolean),
    };

    const sale = await Sale.findOne(query);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    if (
      sale.user_id.toString() !== user_id.toString() &&
      !['admin', 'manager'].includes(userRole)
    ) {
      return res.status(403).json({ error: 'Unauthorized to update this sale' });
    }

    let updatedProducts = sale.products;
    let total_price = sale.total_price;
    let total_profit = sale.profit_made;

    if (products) {
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Products array must be non-empty if provided' });
      }

      // Check duplicates
      const productIds = products.map(p => p.product_id.toString());
      const uniqueIds = new Set(productIds);
      if (productIds.length !== uniqueIds.size) {
        return res.status(400).json({ message: 'Duplicate products are not allowed' });
      }

      // Roll back previous stock
      for (const item of sale.products) {
        const oldProduct = await Product.findById(item.product_id);
        if (oldProduct) {
          oldProduct.quantity += item.quantity;
          await oldProduct.save();
        }
      }

      // Process new products
      updatedProducts = [];
      total_price = 0;
      total_profit = 0;

      for (const item of products) {
        const { product_id, quantity } = item;

        if (quantity <= 0) {
          return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }

        let product = null;
        if (mongoose.Types.ObjectId.isValid(product_id)) {
          product = await Product.findById(product_id);
        }
        if (!product) {
          product = await Product.findOne({ product_id });
        }

        if (!product) {
          return res.status(404).json({ message: `Product not found: ${product_id}` });
        }

        if (product.quantity < quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        product.quantity -= quantity;
        await product.save();

        const amount = +(product.selling_price * quantity).toFixed(2);
        const profit = +((product.selling_price - product.cost_price) * quantity).toFixed(2);

        total_price += amount;
        total_profit += profit;

        updatedProducts.push({ product_id: product._id, quantity });
      }

      sale.products = updatedProducts;
      sale.total_price = +total_price.toFixed(2);
      sale.profit_made = +total_profit.toFixed(2);
    }

    // Apply other fields only if they exist in the request
    if (typeof customer_name === 'string') {
      sale.customer_name = customer_name;
    }

    if (mode_of_payment) {
      sale.mode_of_payment = mode_of_payment;
    }

    sale.updated_at = new Date();
    await sale.save();

    // ✅ Generate invoice
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.sale_id}.pdf`);
    await generateInvoicePdf(sale, res);

  } catch (error) {
    console.error('❌ Error updating sale:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server error while updating sale' });
    }
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const { role: userRole, _id: user_id } = req.user;
    const { id } = req.params;

    const query = {
      $or: [
        { sale_id: id },
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
      ].filter(Boolean)
    };

    const sale = await Sale.findOne(query);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    if (sale.user_id.toString() !== user_id.toString() && !['admin', 'manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized to delete this sale' });
    }

    for (const item of sale.products) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(item.product_id)) {
        product = await Product.findById(item.product_id);
      }
      if (!product) {
        product = await Product.findOne({ product_id: item.product_id });
      }

      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    await Sale.deleteOne({ _id: sale._id });
    res.status(200).json({ success: true, message: 'Sale deleted successfully' });
  } catch (err) {
    console.error("❌ Error deleting sale:", err.message);
    res.status(500).json({ error: 'Server error while deleting sale' });
  }
};


exports.exportSalesToCSV = async (req, res) => {
  try {
    const userRole = req.user.role;

    const sales = await Sale.find()
      .populate('products.product_id')
      .populate('user_id');

      

    const salesData = sales.flatMap((sale) => {
      return sale.products.map((item) => {
        const product = item.product_id;
        const cost_price = product?.cost_price ?? 0;
        const total_price = product?.selling_price ? product.selling_price * item.quantity : 0;
        const profit_made = total_price - (cost_price * item.quantity);

        return {
          product_name: product?.name || 'Unknown',
          quantity: item.quantity,
          selling_price: product?.selling_price || 0,
          cost_price: ['admin', 'manager'].includes(userRole) ? cost_price : undefined,
          profit_made: ['admin', 'manager'].includes(userRole) ? profit_made : undefined,
          total_price: total_price,
          sold_by: sale.user_id
            ? `${sale.user_id.firstName} ${sale.user_id.lastName}`
            : 'Unknown',
          mode_of_payment: sale.mode_of_payment || 'N/A',
          date_of_sale: sale.date_of_sale instanceof Date
            ? sale.date_of_sale.toISOString().split('T')[0]
            : 'Unknown',
        };
      });
    });

    const fields = [
      'product_name',
      'quantity',
      'selling_price',
      ...(userRole === 'admin' || userRole === 'manager' ? ['cost_price', 'profit_made'] : []),
      'total_price',
      'sold_by',
      'mode_of_payment',
      'date_of_sale'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(salesData);

    res.header('Content-Type', 'text/csv');
    res.attachment('sales.csv');
    return res.send(csv);
  } catch (err) {
    console.error('❌ CSV export error:', err.message);
    res.status(500).send('Server Error');
  }
};



// const mongoose = require('mongoose')
// const { Parser } = require('json2csv');
// const Sale = require('../models/salesModel');
// const Product = require('../models/productModel');
// const User = require('../models/userModel')
// const { v4: uuidv4 } = require('uuid');