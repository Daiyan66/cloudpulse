'use strict';

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { createError } = require('./errorHandler');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protects routes by validating the Bearer JWT token in the Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('No token provided. Authorization denied.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError('Token has expired. Please log in again.', 401));
    }
    return next(createError('Invalid token. Authorization denied.', 401));
  }
});

module.exports = { authenticate };
