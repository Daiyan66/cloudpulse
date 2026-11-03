'use strict';

// Set test env vars before anything else loads
process.env.PORT = '5001';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudpulse_test';
process.env.JWT_SECRET = 'test_secret_minimum_32_chars_long_abc';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.MONITOR_INTERVAL_SECONDS = '60';

const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'securepassword123',
  };

  let authToken;

  afterAll(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });

  // ─── Register ──────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.password).toBeUndefined(); // password must NOT leak

      authToken = res.body.data.token;
    });

    it('should reject duplicate email with 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email with 422', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'X', email: 'not-an-email', password: 'pass12345' })
        .expect(422);

      expect(res.body.success).toBe(false);
    });

    it('should reject short password with 422', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'valid@test.com', password: 'short' })
        .expect(422);
    });
  });

  // ─── Login ─────────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject wrong password with 401', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should reject non-existent email with 401', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@nowhere.com', password: 'pass12345' })
        .expect(401);
    });
  });

  // ─── Get Me ────────────────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should reject missing token with 401', async () => {
      await request(app).get('/api/auth/me').expect(401);
    });

    it('should reject invalid token with 401', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  // ─── Health ────────────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health').expect([200, 503]);
      expect(res.body.status).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
