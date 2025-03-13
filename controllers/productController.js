const ProductService = require("../services/productService")

const CreateProduct = async (req, res) => {
    const payload = req.body;
    const user = req.user;
    
    
    const serviceResponse = await ProductService.CreateProduct(
        payload, 
        user
    
    )
    
    return res.status(serviceResponse.code).json(serviceResponse);
}

const GetProduct = async (req, res) => {
    
    const productId = req.params.productId

    const serviceResponse = await ProductService.GetProduct(
        productId 
    )

    return res.status(serviceResponse.code).json(serviceResponse);
}

const GetAllProducts = async (req, res) => {

    const serviceResponse = await ProductService.GetAllProducts({
        search, category, supplier
    }); 

    return res.status(serviceResponse.code).json(serviceResponse);
}


module.exports = GetAllProducts;




const UpdateProduct = async (req, res) => {
    const productId = req.params.productId
    const user = req.user;
    const payload = req.body;

    const serviceResponse = await ProductService.UpdateProduct(
        productId,
        payload,
        user,
    )

    return res.status(serviceResponse.code).json(serviceResponse);
}
const DeleteProduct = async (req, res) => {
    const productId = req.params.productId
    const user = req.user;

    const serviceResponse = await ProductService.DeleteProduct(
        productId,
        user
    )

    return res.status(serviceResponse.code).json(serviceResponse);
}

module.exports = {
    CreateProduct,
    GetAllProducts,
    GetProduct,
    UpdateProduct,
    DeleteProduct
}