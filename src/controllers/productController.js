const Product = require('../models/productModel');
const logger = require('../utils/logger');
const { Parser } = require('json2csv');

exports.createProduct = async (req, res) => {
  try {
    logger.info(`START: Attempting to create a new product`);
    const { name, description, cost_price, quantity, image_url, category, supplier } = req.body;

    if (!name || !cost_price || !quantity || !supplier) {
      return res.status(400).json({ success: false, message: 'name, cost_price, quantity, and supplier are required' });
    }

    const user_id = req.user?._id;

    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const newProduct = await Product.create({
      name,
      description,
      cost_price,
      quantity,
      image_url,
      category,
      supplier,
      user_id,
    });

    logger.info(`END: Successfully created a new product`);
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    logger.error(`ERROR: ${error.message}`);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  const userRole = req.user?.role;

  if (!userRole) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    logger.info(`START: Fetching all products`);
    const { page = 1, limit = 10, search = '' } = req.query;

    if (limit > 20) {
      return res.status(400).json({ success: false, message: 'Limit cannot be greater than 20' });
    }

    const skip = (page - 1) * limit;

    // Build dynamic query (admins, managers, and staff can see all products)
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let [products, totalItems] = await Promise.all([
      Product.find(query).sort({ created_at: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    if (!products.length) {
      return res.status(404).json({ success: false, message: 'No products found' });
    }

    // Hide cost_price for staff
    if (userRole === 'staff') {
      products = products.map(product => {
        const { cost_price, ...rest } = product.toObject();
        return rest;
      });
    }

    const totalPages = Math.ceil(totalItems / limit);
    logger.info(`END: Successfully fetched all products`);
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    logger.error(`ERROR: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  const userRole = req.user?.role;

  if (!userRole) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { id } = req.params;

  try {
    logger.info(`START: Fetching product with ID ${id}`);
    const product = await Product.findOne({ product_id: id });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Hide cost_price for staff
    if (userRole === 'staff') {
      const { cost_price, ...rest } = product.toObject();
      logger.info(`END: Successfully fetched product with ID ${id}`);
      return res.status(200).json({ success: true, data: rest });
    }

    logger.info(`END: Successfully fetched product with ID ${id}`);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    logger.error(`ERROR: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

exports.updateProduct = async (req, res) => {
  const user = req.user;
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Only admin or manager can update products' });
  }

  const { id } = req.params;
  try {
    logger.info(`START: Updating product with ID ${id}`);

    const updateData = { ...req.body };

    // Manually recalculate selling_price if cost_price is being updated
    if (updateData.cost_price !== undefined) {
      updateData.selling_price = updateData.cost_price * 1.2;
    }

    const product = await Product.findOneAndUpdate(
      { product_id: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found or no changes made' });
    }

    logger.info(`END: Successfully updated product with ID ${id}`);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    logger.error(`ERROR: ${error.message}`);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  const user = req.user;
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Only admin or manager can delete products' });
  }

  const { id } = req.params;
  try {
    logger.info(`START: Deleting product with ID ${id}`);
    const result = await Product.deleteOne({ product_id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    logger.info(`END: Successfully deleted product with ID ${id}`);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    logger.error(`ERROR: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};



exports.exportProductsToCSV = async (req, res) => {
  try {
    const products = await Product.find().lean();

    const isAdminOrManager = ['admin', 'manager'].includes(req.user.role);

    const fields = [
      { label: 'Product ID', value: 'product_id' },
      { label: 'Name', value: 'name' },
      { label: 'Quantity', value: 'quantity' },
      ...(isAdminOrManager ? [{ label: 'Cost Price', value: 'cost_price' }] : []),
      { label: 'Selling Price', value: 'selling_price' },
      { label: 'Category', value: 'category' },
      { label: 'Supplier', value: 'supplier' },
      { label: 'Created At', value: row => new Date(row.created_at).toLocaleString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(products);

    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    return res.send(csv);
  } catch (error) {
    console.error('❌ CSV export error:', error);
    res.status(500).json({ message: 'Failed to export products' });
  }
};
