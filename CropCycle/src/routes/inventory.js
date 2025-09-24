const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Add or update inventory
router.post('/add', inventoryController.addOrUpdateInventory);

// List inventory
router.get('/', inventoryController.listInventory);

module.exports = router;
