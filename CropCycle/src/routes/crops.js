const express = require('express');
const router = express.Router();
const cropsController = require('../controllers/cropsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Only farmers can add crops
router.post('/add', authenticate, authorize(['FARMER']), cropsController.addCrop);

// List all crops and anyone can view this
router.get('/', cropsController.listCrops);

module.exports = router;
