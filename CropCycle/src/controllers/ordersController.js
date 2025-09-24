const prisma = require('../config/db');

// Place a new order
exports.createOrder = async (req, res) => {
  try {
    const { buyerId, cropId, quantity } = req.body;

    if (!buyerId || !cropId || !quantity) {
      return res.status(400).json({ error: 'buyerId, cropId, and quantity are required' });
    }

    // Check if buyer exists
    const buyer = await prisma.user.findUnique({ where: { id: parseInt(buyerId) } });
    if (!buyer || buyer.role !== 'BUYER') {
      return res.status(400).json({ error: 'Invalid buyerId' });
    }

    // Check if crop exists
    const crop = await prisma.crop.findUnique({ where: { id: parseInt(cropId) } });
    if (!crop) return res.status(404).json({ error: 'Crop not found' });

    // Optional: Check inventory quantity
    if (crop.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough quantity available' });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerId: parseInt(buyerId),
        cropId: parseInt(cropId),
        quantity: parseInt(quantity)
      },
      include: {
        buyer: true,
        crop: true
      }
    });

    // Optional: Reduce crop quantity in inventory
    await prisma.crop.update({
      where: { id: crop.id },
      data: { quantity: crop.quantity - quantity }
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// List all orders
exports.listOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: true,
        crop: true
      }
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


// Cancel order (buyer only)
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Ensure the logged-in user is the buyer
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }

    // Update instead of hard delete
    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    res.status(200).json({ message: 'Order cancelled', order: cancelledOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};