const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Only buyers can place orders
router.post('/add', authenticate, authorize(['BUYER']), ordersController.createOrder);

router.get('/', authenticate, authorize(['BUYER', 'FARMER']), ordersController.listOrders);

// Cancel order (buyer only)
router.delete('/:id', authenticate, authorize(['BUYER']), ordersController.cancelOrder);


module.exports = router;
