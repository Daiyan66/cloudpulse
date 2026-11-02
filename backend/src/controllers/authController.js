'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../middleware/errorHandler');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

/** Generate a signed JWT for a user */
const signToken = (userId) =>
  jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });

/** Format response with token + user data */
const sendAuthResponse = (res, statusCode, user) => {
  const token = signToken(user._id || user.id);
  res.status(statusCode).json({
    success: true,
    data: { token, user },
  });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(createError('An account with this email already exists.', 409));
  }

  const user = await User.create({ name, email, password });
  sendAuthResponse(res, 201, user);
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Include password field explicitly (it's select:false on the model)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(createError('Invalid email or password.', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(createError('Invalid email or password.', 401));
  }

  sendAuthResponse(res, 200, user);
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(createError('User not found.', 404));
  }
  res.json({ success: true, data: user });
});
