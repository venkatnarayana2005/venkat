
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Creates an Express router to define user-related API routes.
const router = express.Router();

//------- 1. PUBLIC USER FUNCTION ------------------//


// Returns only safe user details to the frontend.
// Never send the hashed password or other sensitive fields.
function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone, 
    gender: user.gender,
    address: user.address 
  };
}

//-------------- 2. AUTHENTICATION MIDDLEWARE-----------

// Checks whether the request contains a valid JWT token.
// Protected routes use this function before executing.
function authenticate(req, res, next) {
  try {
    // Read the Authorization header sent by the frontend.
    const header = req.headers.authorization;

    // Ensure the header contains a Bearer token.
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Please log in.'
      });
    }

    // Check whether the JWT secret is configured in .env.
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Authentication is not configured.'
      });
    }

    // Remove "Bearer " and extract the actual token.
    const token = header.slice(7);

    // Verify the token using the secret key.
    // An invalid or expired token throws an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the token contains a user ID.
    if (!decoded.userId) {
      return res.status(401).json({
        message: 'Invalid authentication token.'
      });
    }

    // Store the authenticated user's ID on the request.
    // The next route can use req.userId.
    req.userId = decoded.userId;

    // Continue to the protected route.
    next();
  } catch (error) {
    // Handles expired, invalid, or malformed tokens.
    return res.status(401).json({
      message: 'Session invalid or expired. Please log in again.'
    });
  }
}

// ==================================================
// 3. REGISTER API
// POST /user/register
// ==================================================

router.post('/register', async (req, res) => {
  try {
    // Extract registration fields from the request body.
    const {
      name,
      email,
      phone,
      password,
      gender,
      address
    } = req.body;

    // Validate required fields and their formats.
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof phone !== 'string' ||
      !/^\d{10}$/.test(phone.trim()) ||
      typeof password !== 'string' ||
      password.length < 8 ||
      typeof gender !== 'string' ||
      ![
        'Male',
        'Female',
        'Other',
        'Prefer not to say'
      ].includes(gender) ||
      typeof address !== 'string' ||
      !address.trim()
    ) {
      // Return an error if any field is invalid.
      return res.status(400).json({
        message: 'Please enter valid details in all required fields.'
      });
    }

    // Limit the maximum length of certain fields.
    if (
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      address.trim().length > 500
    ) {
      return res.status(400).json({
        message: 'One or more fields exceed the allowed length.'
      });
    }

    // Convert email to lowercase to avoid case differences.
    const normalizedEmail = email.trim().toLowerCase();

    // Check whether this email is already registered.
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    // Prevent duplicate registrations.
    if (existingUser) {
      return res.status(409).json({
        message: 'This email is already registered.'
      });
    }

    // Hash the password before saving it to MongoDB.
    // The number 12 is the bcrypt cost factor.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create and save the new user document in MongoDB.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      gender,
      address: address.trim()
    });

    // Send success response without exposing the password.
    return res.status(201).json({
      message: 'Registration successful. Please log in.',
      user: publicUser(user)
    });
  } catch (error) {
    // Log technical details in the backend terminal.
    console.error('Registration error:', error.message);

    // Handle duplicate-key errors from MongoDB.
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This email is already registered.'
      });
    }

    // Handle unexpected registration errors.
    return res.status(500).json({
      message: 'Registration failed. Please try again.'
    });
  }
});

// ==================================================
// 4. LOGIN API
// POST /user/login
// ==================================================

router.post('/login', async (req, res) => {
  try {
    // Extract login credentials from the request body.
    const { email, password } = req.body;

    // Check whether email and password were provided.
    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    // Ensure the JWT secret is configured.
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Login service is not configured.'
      });
    }

    // Find the user by normalized email.
    // select('+password') includes password if the schema
    // defines it with select: false.
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    // Reject incorrect email or password.
    // bcrypt.compare checks the entered password against
    // the stored password hash.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    // Create a signed JWT containing the user's ID.
    // The token expires after one day.
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send the token and safe user details to the frontend.
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Login failed. Please try again.'
    });
  }
});

// ==================================================
// 5. GET CURRENT USER PROFILE
// GET /user/me
// Requires a valid JWT token
// ==================================================

router.get('/me', authenticate, async (req, res) => {
  try {
    // Find the user whose ID was extracted from the JWT.
    const user = await User.findById(req.userId);

    // Check whether the account still exists.
    if (!user) {
      return res.status(404).json({
        message: 'User account not found.'
      });
    }

    // Return the currently authenticated user's details.
    return res.json({
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Get profile error:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve profile.'
    });
  }
});

// ==================================================
// 6. UPDATE CURRENT USER PROFILE
// PUT /user/profile
// Requires a valid JWT token
// ==================================================

router.put('/profile', authenticate, async (req, res) => {
  try {
    // Read the profile fields that can be updated.
    // Email and password are intentionally excluded.
    const {
      name,
      phone,
      gender,
      address
    } = req.body;

    // Validate all profile fields.
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof phone !== 'string' ||
      !/^\d{10}$/.test(phone.trim()) ||
      typeof gender !== 'string' ||
      ![
        'Male',
        'Female',
        'Other',
        'Prefer not to say'
      ].includes(gender) ||
      typeof address !== 'string' ||
      !address.trim()
    ) {
      return res.status(400).json({
        message: 'Please enter valid profile details.'
      });
    }

    // Prevent excessively long values.
    if (
      name.trim().length > 100 ||
      address.trim().length > 500
    ) {
      return res.status(400).json({
        message: 'Name or address is too long.'
      });
    }

    // Update only the authenticated user's document.
    // req.userId comes from the verified JWT.
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          name: name.trim(),
          phone: phone.trim(),
          gender,
          address: address.trim()
        }
      },
      {
        new: true,           // Return the updated document
        runValidators: true  // Run Mongoose schema validation
      }
    );

    // Check whether the user exists.
    if (!user) {
      return res.status(404).json({
        message: 'User account not found.'
      });
    }

    // Return the updated profile without the password.
    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Profile update error:', error.message);

    return res.status(500).json({
      message: 'Unable to update profile.'
    });
  }
});

// ==================================================
// 7. EXPORT ROUTER
// ==================================================

// Makes these routes available to the main Express server.
module.exports = router;
