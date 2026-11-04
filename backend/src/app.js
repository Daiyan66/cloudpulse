/**
 * Main application setup
 */
'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { corsOrigin } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const metricsMiddleware = require('./middleware/metricsMiddleware');
const { register } = require('./utils/metrics');
const logger = require('./utils/logger');

// ─── Routes ───────────────────────────────────────────────────────────────────
const healthRouter  = require('./routes/health');
const authRouter    = require('./routes/auth');
const monitorRouter = require('./routes/monitors');
const alertsRouter  = require('./routes/alerts');
const statusRouter  = require('./routes/status');

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      // Allow all localhost origins in development to prevent port conflicts
      if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'))) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ─── Auth endpoints get stricter rate limiting ────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});
app.use('/api/auth/', authLimiter);

// ─── Request parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── HTTP request logging ─────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.path === '/metrics',
  })
);

// ─── Prometheus instrumentation ───────────────────────────────────────────────
app.use(metricsMiddleware);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/health',        healthRouter);
app.use('/api/auth',      authRouter);
app.use('/api/monitors',  monitorRouter);
app.use('/api/alerts',    alertsRouter);
app.use('/api/status',    statusRouter);

/** Prometheus scrape endpoint */
app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

/** 404 handler */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
