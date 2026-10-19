
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    delivery: {
      fullName: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      pincode: {
        type: String,
        required: true,
        trim: true
      }
    },

    items: [
      {
        productId: {
          type: String,
          default: ''
        },
        product_name: {
          type: String,
          required: true,
          trim: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);