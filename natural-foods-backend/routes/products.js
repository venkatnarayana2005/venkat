const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    console.log('Products found:', products.length);
    res.status(200).json(products);
  } catch (error) {
    console.error('Fetching products failed:', error);
    res.status(500).json({
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

module.exports = router;