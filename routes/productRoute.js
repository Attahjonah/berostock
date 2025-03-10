const Router = require("express").Router
const productController = require("../controllers/productController")
const productMiddleware = require("../middlewares/productMiddleware")

const route = Router()

route.post('/', productMiddleware.validatingProductCreated, productController.CreateProduct)
route.get('/', productController.GetAllProduct)
route.get('/:productId', productController.GetProduct)
route.put('/:productId', productController.UpdateProduct)
route.delete('/:productId', productController.DeleteProduct) 


module.exports = route 