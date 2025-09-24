require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// // View engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/auth', require('./routes/auth'));
app.use('/crops', require('./routes/crops'));
app.use('/orders', require('./routes/orders'));

// // Pages routes
// app.get('/login', (req, res) => res.render('login'));
// app.get('/register', (req, res) => res.render('register'));
// app.get('/crops', (req, res) => res.render('crops', { user: { role: 'FARMER' } })); 
// app.get('/orders', (req, res) => res.render('orders', { user: { role: 'BUYER' } }));

// Redirect home to login
app.get('/', (req, res) => res.redirect('/login'));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
