const Router = require("express").Router
const productController = require("../controllers/productController")
const productMiddleware = require("../middlewares/productMiddleware")
const authMiddleware = require("../middlewares/authMiddleware")

const route = Router()

route.post('/', authMiddleware.ValidateToken, productMiddleware.validatingProductCreated, productController.CreateProduct)
route.get('/', productController.GetAllProduct)
route.get('/:productId', productController.GetProduct)
route.put('/:productId', productController.UpdateProduct)
route.delete('/:productId', productController.DeleteProduct) 


module.exports = route 