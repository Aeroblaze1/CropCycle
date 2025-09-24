const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register via form / API
exports.registerForm = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.send('All fields are required');

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.send('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role } });

    res.json({ message: 'User registered', user });
  } catch (err) {
    console.error(err);
    res.send('Error registering user');
  }
};

// Login via form / API
exports.loginForm = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.send('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send('Invalid password');

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error(err);
    res.send('Error logging in');
  }
};

// Delete a user - admin or self
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(id))
      return res.status(403).json({ error: 'Forbidden' });

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete crop (farmer only)
exports.deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const crop = await prisma.crop.findUnique({ where: { id: parseInt(id) } });
    if (!crop) return res.status(404).json({ error: 'Crop not found' });

    if (crop.farmerId !== req.user.id)
      return res.status(403).json({ error: 'Only the owner farmer can delete this crop' });

    await prisma.crop.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cancel order (buyer only)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.buyerId !== req.user.id)
      return res.status(403).json({ error: 'Only the buyer can cancel this order' });

    await prisma.order.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
