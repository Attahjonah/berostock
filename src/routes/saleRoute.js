const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware')
const { saleRateLimiter } = require('../middlewares/rateLimiter');

router.use(authMiddleware);
router.use(saleRateLimiter); // Apply rate limit to all sale routes

router.get('/export', authMiddleware, saleController.exportSalesToCSV);
router.post('/', saleController.createSale);
router.get('/', saleController.getAllSales);
router.get('/:id', authorizeRoles("admin", "manager", "staff"), saleController.getSaleById);
router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);



module.exports = router;
