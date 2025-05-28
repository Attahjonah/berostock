const mongoose = require('mongoose')
const { Parser } = require('json2csv');
const Sale = require('../models/salesModel');
const Product = require('../models/productModel');
const User = require('../models/userModel')
const { v4: uuidv4 } = require('uuid');


exports.createSale = async (req, res) => {
  try {
    const { product_id, quantity, mode_of_payment } = req.body;

    if (!['POS', 'Transfer', 'Cash'].includes(mode_of_payment)) {
      return res.status(400).json({ message: 'Invalid mode of payment' });
    }

    // 🔍 Find product by either _id or UUID
    let product = null;

    if (mongoose.Types.ObjectId.isValid(product_id)) {
      product = await Product.findOne({ _id: product_id });
    }

    if (!product) {
      product = await Product.findOne({ product_id });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🚫 Check stock availability
    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // 💰 Calculate totals
    const total_price = +(product.selling_price * quantity).toFixed(2);
    const profit_made = +((product.selling_price - product.cost_price) * quantity).toFixed(2);

    // 🛒 Create sale
    const sale = await Sale.create({
      user_id: req.user._id,
      product_id: product._id,
      quantity,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      total_price,
      profit_made,
      mode_of_payment
    });

    // 📉 Deduct quantity from product stock
    product.quantity -= quantity;
    await product.save();

    // 🧾 Prepare response
    const response = {
      message: "Sale recorded successfully",
      sale: {
        _id: sale._id,
        product_id: product.product_id, // Return UUID for frontend readability
        quantity: sale.quantity,
        selling_price: sale.selling_price,
        total_price: sale.total_price,
        createdAt: sale.createdAt,
        mode_of_payment: sale.mode_of_payment
      }
    };

    // 🔐 Include sensitive fields for admins and managers
    if (['admin', 'manager'].includes(req.user.role)) {
      response.sale.cost_price = sale.cost_price;
      response.sale.profit_made = sale.profit_made;
    }

    return res.status(201).json(response);

  } catch (error) {
    console.error("❌ Create sale error:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    // Filter by product_id (exact match)
    if (product_id) {
      query.product_id = product_id;
    }

    // Search by product name
    if (search) {
      const productIds = await Product.find({
        name: { $regex: search, $options: 'i' },
      }).distinct('_id');
      query.product_id = { $in: productIds };
    }

    // Filter by userId
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query.user_id = userId;
      } else {
        return res.status(400).json({ error: 'Invalid userId format' });
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date_of_sale = {};
      if (startDate) query.date_of_sale.$gte = new Date(startDate);
      if (endDate) query.date_of_sale.$lte = new Date(endDate);
    }

    // Query execution with user and product populated
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date_of_sale: -1 })
      .populate('user_id', 'firstName lastName')
      .populate('product_id', 'product_id name');

    const totalSales = sales.reduce((acc, sale) => acc + sale.total_price, 0);
    const totalProfit =
      userRole === 'admin' || userRole === 'manager'
        ? sales.reduce((acc, sale) => acc + sale.profit_made, 0)
        : undefined;

    const responseSales = sales.map((sale) => {
      const saleObj = sale.toObject();

      // Format date_of_sale as YYYY-MM-DD
      saleObj.date_of_sale = saleObj.date_of_sale instanceof Date
        ? saleObj.date_of_sale.toISOString().split('T')[0]
        : 'Unknown';

      // Include sale_id (UUID)
      saleObj.sale_id = sale.sale_id;

      // Add sold_by field combining user's first and last names
      saleObj.sold_by = sale.user_id
        ? `${sale.user_id.firstName} ${sale.user_id.lastName}`
        : 'Unknown';

      // Replace product_id ObjectId with UUID string for readability
      if (sale.product_id && sale.product_id.product_id) {
        saleObj.product_id = sale.product_id.product_id;
        saleObj.product_name = sale.product_id.name;
      }

      // Remove sensitive fields for normal users
      if (userRole !== 'admin' && userRole !== 'manager') {
        delete saleObj.profit_made;
        delete saleObj.cost_price;
      }

      // Optionally remove full user_id and product_id objects from response
      delete saleObj.user_id;
      delete saleObj.product_id; // you can keep or remove based on preference

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

    // Try to find sale by either sale_id (UUID) or _id (ObjectId)
    const query = {
      $or: [
        { sale_id: id },
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
      ].filter(Boolean)
    };

    const sale = await Sale.findOne(query);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const saleObj = sale.toObject();
    if (!['admin', 'manager'].includes(userRole)) {
      delete saleObj.profit_made;
      delete saleObj.cost_price;
    }

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
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    // 🧠 Try finding the sale by sale_id (UUID) or Mongo _id
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

    // 🛑 Check permission
    if (
      sale.user_id.toString() !== user_id.toString() &&
      userRole !== 'admin' &&
      userRole !== 'manager'
    ) {
      return res.status(403).json({ error: 'Unauthorized to update this sale' });
    }

    // 🔄 Restore quantity to the previous product
    const oldProduct = await Product.findById(sale.product_id);
    if (oldProduct) {
      oldProduct.quantity += sale.quantity;
      await oldProduct.save();
    }

    // 🔍 Find new product by either _id or UUID
    let newProduct = null;

    if (mongoose.Types.ObjectId.isValid(product_id)) {
      newProduct = await Product.findOne({ _id: product_id });
    }

    if (!newProduct) {
      newProduct = await Product.findOne({ product_id: product_id });
    }

    if (!newProduct) {
      return res.status(404).json({ error: 'New product not found' });
    }

    if (newProduct.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock for new product' });
    }

    // 🧾 Deduct quantity from new product stock
    newProduct.quantity -= quantity;
    await newProduct.save();

    // ✅ Update sale fields
    sale.product_id = newProduct._id;
    sale.quantity = quantity;
    sale.cost_price = newProduct.cost_price;
    sale.selling_price = newProduct.selling_price;
    sale.total_price = +(quantity * newProduct.selling_price).toFixed(2);
    sale.profit_made = +(sale.total_price - (sale.cost_price * quantity)).toFixed(2);
    sale.updated_at = new Date();
    await sale.save();

    const responseData = sale.toObject();
    if (userRole !== 'admin' && userRole !== 'manager') {
      delete responseData.cost_price;
      delete responseData.profit_made;
    }

    return res.status(200).json({
      success: true,
      message: 'Sale updated successfully',
      data: responseData,
    });

  } catch (error) {
    console.error('❌ Error updating sale:', error.message);
    return res.status(500).json({ error: 'Server error while updating sale' });
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

    // Find product by either _id or UUID to restore stock
    let product = null;
    if (mongoose.Types.ObjectId.isValid(sale.product_id)) {
      product = await Product.findById(sale.product_id);
    }
    if (!product) {
      product = await Product.findOne({ product_id: sale.product_id });
    }

    if (product) {
      product.quantity += sale.quantity;
      await product.save();
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
      .populate('product_id')
      .populate('user_id');

    const salesData = sales.map((sale) => {
      const cost_price = sale.product_id?.cost_price ?? 0;
      const total_price = sale.total_price ?? 0;
      const profit_made = total_price - (cost_price * sale.quantity);

      return {
        product_name: sale.product_id?.name || 'Unknown',
        quantity: sale.quantity,
        selling_price: sale.product_id?.selling_price || 0,
        cost_price: ['admin', 'manager'].includes(userRole) ? cost_price : undefined,
        profit_made: ['admin', 'manager'].includes(userRole) ? profit_made : undefined,
        total_price: total_price,
        sold_by: sale.user_id ? `${sale.user_id.firstName} ${sale.user_id.lastName}` : 'Unknown',
        mode_of_payment: sale.mode_of_payment || 'N/A',
        date_of_sale: sale.date_of_sale instanceof Date
      ? sale.date_of_sale.toISOString().split('T')[0]
      : 'Unknown',
      };
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
