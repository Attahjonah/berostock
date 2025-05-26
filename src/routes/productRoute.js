const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middlewares/authMiddleware'); 
const authorizeRoles = require('../middlewares/roleMiddleware');
const { productRateLimiter } = require('../middlewares/rateLimiter');



// Apply rate-limiter middleware only to product routes
router.use(authenticate, productRateLimiter);

router.post('/', authorizeRoles('admin', 'manager'), productController.createProduct);
router.get('/',  authorizeRoles("admin", "manager", "staff"), productController.getAllProducts);
router.get('/:id',  authorizeRoles("admin", "manager", "staff"), productController.getProductById);
router.put('/:id', authorizeRoles('admin', 'manager'), productController.updateProduct);
router.delete('/:id', authorizeRoles('admin', 'manager'), productController.deleteProduct);

module.exports = router;
