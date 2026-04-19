const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Stocks route is available' });
});

module.exports = router;
