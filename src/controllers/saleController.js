const mongoose = require('mongoose')
const { Parser } = require('json2csv');
const Sale = require('../models/salesModel');
const Product = require('../models/productModel');
const User = require('../models/userModel')
const { v4: uuidv4 } = require('uuid');


exports.createSale = async (req, res) => {
  try {
    const { product_id: productUUID, quantity, mode_of_payment } = req.body;

    if (!['POS', 'Transfer', 'Cash'].includes(mode_of_payment)) {
        return res.status(400).json({ message: 'Invalid mode of payment' });
    }

    // ✅ Find product by UUID
    const product = await Product.findOne({ product_id: productUUID });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const total_price = +(product.selling_price * quantity).toFixed(2);
    const profit_made = +((product.selling_price - product.cost_price) * quantity).toFixed(2);

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

    // ✅ Prepare response based on user role
    const response = {
      message: "Sale recorded successfully",
      sale: {
        _id: sale._id,
        product_id: product.product_id, // return UUID for readability
        quantity: sale.quantity,
        selling_price: sale.selling_price,
        total_price: sale.total_price,
        createdAt: sale.createdAt,
        mode_of_payment: sale.mode_of_payment
      }
    };

    // ✅ Include sensitive fields only for admin and manager
    if (req.user.role === 'admin' || req.user.role === 'manager') {
      response.sale.cost_price = sale.cost_price;
      response.sale.profit_made = sale.profit_made;
    }

    res.status(201).json(response);

  } catch (error) {
    console.error("❌ Create sale error:", error);
    res.status(500).json({ message: "Internal server error" });
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

    // 📦 Filter by product_id (exact match)
    if (product_id) {
      query.product_id = product_id;
    }

    // 🔍 Search by product name
    if (search) {
      const productIds = await Product.find({
        name: { $regex: search, $options: 'i' },
      }).distinct('product_id');
      query.product_id = { $in: productIds };
    }

    // 👤 Filter by userId
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query.user_id = userId;
      } else {
        return res.status(400).json({ error: 'Invalid userId format' });
      }
    }

    // 📅 Filter by date range
    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) query.created_at.$gte = new Date(startDate);
      if (endDate) query.created_at.$lte = new Date(endDate);
    }

    // Query execution
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const totalSales = sales.reduce((acc, sale) => acc + sale.total_price, 0);
    const totalProfit =
      userRole === 'admin' || userRole === 'manager'
        ? sales.reduce((acc, sale) => acc + sale.profit_made, 0)
        : undefined;

    // Filter fields for normal users
    const responseSales = sales.map((sale) => {
      const saleObj = sale.toObject();
      if (userRole !== 'admin' && userRole !== 'manager') {
        delete saleObj.profit_made;
        delete saleObj.cost_price;
      }
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

    const query = {
      $or: [
        { sale_id: id },
        mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
      ].filter(Boolean)
    };

    const sale = await Sale.findOne(query);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    const saleObj = sale.toObject();
    if (userRole !== 'admin' && userRole !== 'manager') {
      delete saleObj.profit_made;
      delete saleObj.cost_price;
    }

    return res.status(200).json({ success: true, data: saleObj });
  } catch (error) {
    console.error('❌ Error fetching sale by ID:', error.message);
    return res.status(500).json({ error: 'Server error while fetching sale' });
  }
};


exports.updateSale = async (req, res) => {
  const user_id = req.user._id;
  const userRole = req.user.role;
  const { id } = req.params;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }

  const query = {
    $or: [
      { sale_id: id },
      mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null,
    ].filter(Boolean)
  };

  const sale = await Sale.findOne(query);
  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  if (sale.user_id.toString() !== user_id.toString() && userRole !== 'admin' && userRole !== 'manager') {
    return res.status(403).json({ error: 'Unauthorized to update this sale' });
  }

  const previousProduct = await Product.findOne({ product_id: sale.product_id });
  if (previousProduct) {
    previousProduct.quantity += sale.quantity;
    await previousProduct.save();
  }

  const newProduct = await Product.findOne({ product_id });
  if (!newProduct) return res.status(404).json({ error: 'New product not found' });
  if (newProduct.quantity < quantity) {
    return res.status(400).json({ error: 'Insufficient stock for new product' });
  }

  newProduct.quantity -= quantity;
  await newProduct.save();

  sale.product_id = product_id;
  sale.quantity = quantity;
  sale.cost_price = newProduct.cost_price;
  sale.selling_price = newProduct.selling_price;
  sale.total_price = quantity * newProduct.selling_price;
  sale.profit_made = sale.total_price - (sale.cost_price * quantity);
  sale.updated_at = new Date();
  await sale.save();

  const responseData = sale.toObject();
  if (userRole !== 'admin' && userRole !== 'manager') {
    delete responseData.cost_price;
    delete responseData.profit_made;
  }

  res.status(200).json({ success: true, message: 'Sale updated', data: responseData });
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

    if (sale.user_id.toString() !== user_id.toString() && userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Unauthorized to delete this sale' });
    }

    const product = await Product.findOne({ product_id: sale.product_id });
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
        cost_price: userRole !== 'admin' && userRole !== 'manager' ? undefined : cost_price,
        profit_made: userRole !== 'admin' && userRole !== 'manager' ? undefined : profit_made,
        total_price: total_price,
        sold_by: sale.user_id ? `${sale.user_id.firstName} ${sale.user_id.lastName}` : 'Unknown',
        mode_of_payment: sale.mode_of_payment || 'N/A',
        date_of_sale: sale.date_of_sale ? sale.date_of_sale.toISOString().split('T')[0] : 'Unknown'

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
