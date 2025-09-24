const prisma = require('../config/db');

// Add or update inventory for a farmer
exports.addOrUpdateInventory = async (req, res) => {
  try {
    const { farmerId, crops } = req.body;
    // crops should be an array of { name, region, quantity }

    if (!farmerId || !crops || !Array.isArray(crops) || crops.length === 0) {
      return res.status(400).json({ error: 'Farmer ID and crops are required' });
    }

    // Check if farmer exists
    const farmer = await prisma.user.findUnique({ where: { id: parseInt(farmerId) } });
    if (!farmer || farmer.role !== 'FARMER') {
      return res.status(400).json({ error: 'Invalid farmer ID' });
    }

    // Check if inventory exists for this farmer
    let inventory = await prisma.inventory.findUnique({ where: { farmerId: parseInt(farmerId) } });

    if (!inventory) {
      // Create inventory
      inventory = await prisma.inventory.create({
        data: {
          farmerId: parseInt(farmerId)
        }
      });
    }

    // Add crops and link them to farmer
    const cropPromises = crops.map(c =>
      prisma.crop.create({
        data: {
          name: c.name,
          region: c.region,
          quantity: parseInt(c.quantity),
          farmerId: parseInt(farmerId),
          inventoryId: inventory.id
        }
      })
    );

    const addedCrops = await Promise.all(cropPromises);

    res.status(201).json({ message: 'Inventory updated', inventoryId: inventory.id, crops: addedCrops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// List inventory for all farmers
exports.listInventory = async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        farmer: true,
        crops: true
      }
    });
    res.json(inventories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
