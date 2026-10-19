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

router.post('/', async (req, res) => {
  try {
    const { product_name, price, description, category, image } = req.body;

    if (!product_name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required.'
      });
    }

    const product = await Product.create({
      product_name: String(product_name).trim(),
      price: Number(price),
      description: description || '',
      category: category || '',
      ...(image !== undefined ? { image } : {})
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully.',
      product
    });
  } catch (error) {
    console.error('POST /products error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to add product.',
      error: error.message
    });
  }
});

module.exports = router;