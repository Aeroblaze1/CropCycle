const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/authMiddleware'); 

// router.get('/login', (req, res) => res.render('login'));
// router.get('/register', (req, res) => res.render('register'));

router.post('/register', authController.registerForm); // create user
router.post('/login', authController.loginForm);       // authenticate & get JWT

router.post('/logout', (req, res) => {
  res.redirect('/auth/login');
});

// DELETE user (admin or self)
router.delete('/:id', authenticate, authorize(['ADMIN']), authController.deleteUser);

module.exports = router;