const express = require('express');
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.get('/holdings', auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user.id }).sort({ updatedAt: -1 });

    const mapped = holdings.map((h) => {
      const invested = h.quantity * h.averagePrice;
      const currentPrice = h.averagePrice;
      const currentValue = h.quantity * currentPrice;
      return {
        id: h._id,
        symbol: h.symbol,
        name: h.name,
        sector: h.sector,
        quantity: h.quantity,
        averagePrice: h.averagePrice,
        currentPrice,
        invested,
        currentValue,
        pnl: currentValue - invested,
        pnlPercent: invested > 0 ? ((currentValue - invested) / invested) * 100 : 0,
      };
    });

    return res.json({ holdings: mapped });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch holdings', error: error.message });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user.id });

    const summary = holdings.reduce(
      (acc, h) => {
        const invested = h.quantity * h.averagePrice;
        const currentValue = h.quantity * h.averagePrice;

        acc.totalInvested += invested;
        acc.currentValue += currentValue;
        acc.totalHoldings += 1;
        acc.totalQuantity += h.quantity;

        return acc;
      },
      { totalInvested: 0, currentValue: 0, totalHoldings: 0, totalQuantity: 0 },
    );

    summary.totalPnl = summary.currentValue - summary.totalInvested;
    summary.totalPnlPercent =
      summary.totalInvested > 0 ? (summary.totalPnl / summary.totalInvested) * 100 : 0;

    return res.json({ summary });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
  }
});

router.get(
  '/transactions',
  auth,
  [query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit should be between 1 and 200')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const limit = Number(req.query.limit || 50);
      const transactions = await Transaction.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(limit);
      return res.json({ transactions });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
  },
);

router.post(
  '/buy',
  auth,
  [
    body('symbol').trim().isLength({ min: 1 }).withMessage('Symbol is required'),
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('sector').optional().trim().isLength({ min: 1, max: 60 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const symbol = String(req.body.symbol).toUpperCase().trim();
      const name = String(req.body.name).trim();
      const sector = req.body.sector ? String(req.body.sector).trim() : 'Other';
      const quantity = Number(req.body.quantity);
      const price = Number(req.body.price);

      let holding = await Holding.findOne({ user: req.user.id, symbol });
      if (!holding) {
        holding = await Holding.create({
          user: req.user.id,
          symbol,
          name,
          sector,
          quantity,
          averagePrice: price,
        });
      } else {
        const newQuantity = holding.quantity + quantity;
        const weightedAvg =
          (holding.quantity * holding.averagePrice + quantity * price) / Math.max(1e-9, newQuantity);

        holding.name = name;
        holding.sector = sector;
        holding.quantity = newQuantity;
        holding.averagePrice = weightedAvg;
        await holding.save();
      }

      await Transaction.create({
        user: req.user.id,
        symbol,
        name,
        type: 'BUY',
        quantity,
        price,
        amount: quantity * price,
        realizedPnl: 0,
      });

      return res.status(201).json({ message: 'Buy transaction recorded', holding });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to record buy transaction', error: error.message });
    }
  },
);

router.post(
  '/sell',
  auth,
  [
    body('symbol').trim().isLength({ min: 1 }).withMessage('Symbol is required'),
    body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    try {
      const symbol = String(req.body.symbol).toUpperCase().trim();
      const sellQty = Number(req.body.quantity);
      const sellPrice = Number(req.body.price);

      const holding = await Holding.findOne({ user: req.user.id, symbol });
      if (!holding) {
        return res.status(404).json({ message: 'Holding not found for symbol' });
      }

      if (holding.quantity < sellQty) {
        return res.status(400).json({
          message: 'Insufficient quantity for sell order',
          availableQuantity: holding.quantity,
        });
      }

      const realizedPnl = (sellPrice - holding.averagePrice) * sellQty;
      const remainingQty = holding.quantity - sellQty;

      if (remainingQty <= 0) {
        await Holding.deleteOne({ _id: holding._id });
      } else {
        holding.quantity = remainingQty;
        await holding.save();
      }

      await Transaction.create({
        user: req.user.id,
        symbol,
        name: holding.name,
        type: 'SELL',
        quantity: sellQty,
        price: sellPrice,
        amount: sellQty * sellPrice,
        realizedPnl,
      });

      return res.json({
        message: 'Sell transaction recorded',
        symbol,
        soldQuantity: sellQty,
        realizedPnl,
        remainingQuantity: Math.max(0, remainingQty),
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to record sell transaction', error: error.message });
    }
  },
);

module.exports = router;
