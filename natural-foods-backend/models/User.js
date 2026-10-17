const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);