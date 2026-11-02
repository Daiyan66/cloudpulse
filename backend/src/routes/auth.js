'use strict';

const { Router } = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { registerRules, loginRules, validate } = require('../validators/authValidators');
const { authenticate } = require('../middleware/authenticate');

const router = Router();

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Response: { success, data: { token, user } }
 */
router.post('/register', registerRules, validate, register);

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { success, data: { token, user } }
 */
router.post('/login', loginRules, validate, login);

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Response: { success, data: user }
 */
router.get('/me', authenticate, getMe);

module.exports = router;
