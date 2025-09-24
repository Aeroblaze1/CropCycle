const prisma = require('../config/db');

// Add a new crop (farmer only)
exports.addCrop = async (req, res) => {
  try {
    const { name, region, quantity, farmerId } = req.body;

    if (!name || !region || !quantity || !farmerId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const crop = await prisma.crop.create({
      data: { name, region, quantity: parseInt(quantity), farmerId: parseInt(farmerId) }
    });

    res.status(201).json({ message: 'Crop added', crop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// List all crops
exports.listCrops = async (req, res) => {
  try {
    const crops = await prisma.crop.findMany({
      include: { farmer: true }
    });
    res.json(crops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
