
const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// POST http://localhost:5000/orders
// Place a new order
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      delivery,
      items
    } = req.body;

    if (
      !userId ||
      !userEmail ||
      !delivery ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'User ID, email, delivery details, and cart items are required.'
      });
    }

    const requiredFields = [
      'fullName',
      'phone',
      'address',
      'city',
      'state',
      'pincode'
    ];

    for (const field of requiredFields) {
      if (!String(delivery[field] || '').trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required.`
        });
      }
    }

    const orderItems = items.map(item => ({
      productId: String(item.productId || item._id || ''),
      product_name: String(item.product_name || ''),
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    for (const item of orderItems) {
      if (
        !item.product_name ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'One or more cart items are invalid.'
        });
      }
    }

    // Calculate the total on the server.
    const calculatedTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId: String(userId),
      userEmail: String(userEmail).trim().toLowerCase(),
      delivery: {
        fullName: delivery.fullName.trim(),
        phone: delivery.phone.trim(),
        address: delivery.address.trim(),
        city: delivery.city.trim(),
        state: delivery.state.trim(),
        pincode: delivery.pincode.trim()
      },
      items: orderItems,
      totalAmount: calculatedTotal,
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


// GET order history by user ID

router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId.trim();

    console.log('[ORDER HISTORY] Requested userId:', userId);

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    console.log('[ORDER HISTORY] Orders found:', orders.length);

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('[ORDER HISTORY ERROR]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order history.',
      error: error.message
    });
  }
});


module.exports = router;

// GET order history by customer email
// GET http://localhost:5000/orders/email/customer@example.com
router.get('/email/:email', async (req, res) => {
  try {
    const email = String(req.params.email || '')
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required.'
      });
    }

    const orders = await Order.find({
      userEmail: email
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('GET orders by email error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve orders.'
    });
  }
});

module.exports = router;
