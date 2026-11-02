'use strict';

const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const { createError } = require('../middleware/errorHandler');

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`).join(', ');
    return next(createError(messages, 422));
  }
  next();
};

const createMonitorRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('url')
    .trim().notEmpty().withMessage('URL is required')
    .matches(/^https?:\/\/.+/).withMessage('URL must start with http:// or https://'),
  body('intervalSeconds').optional()
    .isInt({ min: 30, max: 86400 }).withMessage('Interval must be 30–86400 seconds'),
];

const updateMonitorRules = [
  body('name').optional().trim().isLength({ max: 100 }),
  body('url').optional().trim().matches(/^https?:\/\/.+/).withMessage('Invalid URL format'),
  body('intervalSeconds').optional().isInt({ min: 30, max: 86400 }),
  body('isActive').optional().isBoolean(),
];

module.exports = { validate, createMonitorRules, updateMonitorRules };
