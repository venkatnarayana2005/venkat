
const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// POST /orders - Place an order
router.post('/', async (req, res) => {
  try {
    const { userId, delivery, items } = req.body;

    if (
      !userId ||
      !delivery ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'User ID, delivery details, and cart items are required.'
      });
    }

    const fields = [
      'fullName',
      'phone',
      'address',
      'city',
      'state',
      'pincode'
    ];

    for (const field of fields) {
      if (!String(delivery[field] || '').trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`
        });
      }
    }

    const orderItems = [];

    for (const item of items) {
      const productName = String(item.product_name || '').trim();
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !productName ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'One or more cart items are invalid.'
        });
      }

      orderItems.push({
        productId: String(item.productId || item._id || ''),
        product_name: productName,
        price,
        quantity
      });
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId: String(userId).trim(),
      delivery: {
        fullName: delivery.fullName.trim(),
        phone: delivery.phone.trim(),
        address: delivery.address.trim(),
        city: delivery.city.trim(),
        state: delivery.state.trim(),
        pincode: delivery.pincode.trim()
      },
      items: orderItems,
      totalAmount,
      status: 'Pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order
    });
  } catch (error) {
    console.error('POST /orders error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to place order.',
      error: error.message
    });
  }
});

// GET /orders/user/:userId - Retrieve orders by user ID

router.get('/user/:userId', async (req, res) => {
  try {
    const userId = String(req.params.userId || '').trim();

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.'
      });
    }

    // Retrieve orders belonging to this user
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    console.log('User ID:', userId);
    console.log('Orders found:', orders.length);

    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Order history error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order history.',
      error: error.message
    });
  }
});


module.exports = router;