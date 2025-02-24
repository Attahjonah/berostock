const Router = require("express").Router
const productController = require("../controllers/productController")

const route = Router()

route.post('/', productController.CreateProduct)
route.get('/', productController.GetAllProduct)
route.get('/:productId', productController.GetProduct)
route.update('/:productId', productController.UpdateProduct)
route.delete('/:productId', productController.DeleteProduct)


module.exports = route