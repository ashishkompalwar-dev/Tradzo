require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/ipo', require('./routes/ipo'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/chatbot', require('./routes/chatbot'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'Tradzo API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Tradzo server running on port ${PORT}`));
