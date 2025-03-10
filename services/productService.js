const ProductModel = require("../models/productModel")

// Create Product
const CreateProduct = async (payload, user) => {
    //const{body}   = payload;
  
    try {
      const product = await ProductModel.create({
        ...payload,
        user_id: user._id,
      });
      return {
        code: 201,
        success: true,
        message: "Product created successfully",
        data: {
          product,
        },
      }; 
    } catch (error) {
      if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyValue)[0];
        return {
          code: 400,
          success: false,
          message: "Duplicate key",
          data: { message: `${duplicatedField} already exist` },
        };
      }
    }
  
    return {
      code: 404,
      success: false,
      message: "Product not found",
      data: null,
    };
  };
  // Get Product by ID
    const GetProduct = async (productId) => {
    const product = await ProductModel.findById(productId)
      
  
    if (!product) {
      return {
        code: 404,
        success: false,
        message: "Product not found",
        data: null,
      };
    }
  
    //await ProductModel.findByIdAndUpdate(productId);
  
    return {
      code: 200,
      success: true,
      message: "Product found",
      data: {
        product,
      },
    };
  };
  
  // Get all Products
  const GetAllProduct = async ({
    user_id,
    text,
    page = 1,
    status,
    category,
    supplier,
    perPage = 10,
  }) => {
    const query = {};
  
    // if (user_id) {
    //   query.author = user_id;
    // }
  
    if (text) {
      query.$or = [
        { title: { $regex: text, $options: "i" } },
        { body: { $regex: text, $options: "i" } },
      ];
    }
  
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    if (supplier) {
      query.supplier = supplier;
    }
  
    
  
    const products = await ProductModel.paginate(query, { page, limit: perPage });
  
    return {
      code: 200,
      success: true,
      message: "Product found",
      data: {
        products,
      },
    };
  };
  
  // Update Product
  const UpdateProduct = async (productId, payload, user) => {
    try {
      const product = await ProductModel.findById(productId);
  
      if (!product) {
        return {
          code: 404,
          success: false,
          message: "Product not found",
          data: null,
        };
      }
      
  
      // Updating provided payload fields
      product.name = payload.name || product.name;
      product.picture = payload.picture || product.picture;
      product.stock = payload.stock || product.stock;
      product.status = payload.status || product.status;
      product.description = payload.description || product.description;
      product.price = payload.price || product.price;
      product.category = payload.category || product.category;
      product.supplier = payload.supplier || product.supplier;
  
  
      product.updatedAt = new Date();
  
      await product.save();
  
      return {
        code: 200,
        success: true,
        message: "product updated successfully",
        data: {
          product,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: "Error occured while updating the product",
        data: null,
      };
    }
  };
  
  // Deleting a product
    const DeleteProduct = async (productId) => {
    const product = await ProductModel.findById(productId);
  
    if (!product) {
      return {
        code: 404,
        success: false,
        message: "product not found",
        data: null,
      };
    }
  
    if (!product.createdBy.equals('admin')) {
      return {
        code: 404,
        success: false,
        message: "You are not allowed to delete this product",
        data: null,
      };
    }
  
    await ProductModel.findByIdAndDelete(productId);
  
    return {
      code: 200,
      success: true,
      message: "product deleted successfully",
      data: null,
    };
  };
  
  module.exports = {
    CreateProduct,
    GetProduct,
    GetAllProduct,
    UpdateProduct,
    DeleteProduct,
  };
  