'use strict';

const { Router } = require('express');
const mongoose = require('mongoose');
const { getActiveCount } = require('../services/pingService');

const router = Router();

/**
 * GET /health
 * Returns service status, uptime, MongoDB connectivity, and ping engine stats.
 */
router.get('/', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = dbState === 1 ? 'ok' : 'error';
  const healthy = dbStatus === 'ok';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      api: 'ok',
      database: dbStatus,
      pingEngine: { activeMonitors: getActiveCount() },
    },
  });
});

module.exports = router;
