'use strict';

const axios = require('axios');
const cron = require('node-cron');
const Monitor = require('../models/Monitor');
const PingResult = require('../models/PingResult');
const logger = require('../utils/logger');
const { pingChecksTotal, pingResponseTime, activeMonitorsGauge } = require('../utils/metrics');

/** Map of monitorId → cron task instance */
const activeTasks = new Map();

/**
 * Perform a single HTTP ping for a monitor.
 * Saves a PingResult and updates the Monitor's denormalized fields.
 */
async function pingMonitor(monitor) {
  const startTime = Date.now();
  let result = { statusCode: null, responseTimeMs: 0, isUp: false, error: null };

  try {
    const response = await axios.get(monitor.url, {
      timeout: 10000, // 10s timeout
      validateStatus: () => true, // don't throw on 4xx/5xx — we record them
      headers: { 'User-Agent': 'CloudPulse-Monitor/1.0' },
      maxRedirects: 5,
    });

    result.responseTimeMs = Date.now() - startTime;
    result.statusCode = response.status;
    result.isUp = response.status < 400;
  } catch (err) {
    result.responseTimeMs = Date.now() - startTime;
    result.isUp = false;
    result.error = err.code || err.message || 'Unknown error';
  }

  // ─── Persist ping result ──────────────────────────────────────────────────
  try {
    await PingResult.create({
      monitor: monitor._id,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
      isUp: result.isUp,
      error: result.error,
    });

    // ─── Recompute 24h uptime % and update monitor ────────────────────────
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [agg] = await PingResult.aggregate([
      { $match: { monitor: monitor._id, checkedAt: { $gte: since24h } } },
      { $group: { _id: null, total: { $sum: 1 }, up: { $sum: { $cond: ['$isUp', 1, 0] } } } },
    ]);

    const uptimePercentage = agg ? +((agg.up / agg.total) * 100).toFixed(2) : null;

    await Monitor.findByIdAndUpdate(monitor._id, {
      lastCheckedAt: new Date(),
      lastStatusCode: result.statusCode,
      lastResponseTimeMs: result.responseTimeMs,
      isUp: result.isUp,
      uptimePercentage,
    });
  } catch (dbErr) {
    logger.error(`Failed to save ping result for ${monitor.url}: ${dbErr.message}`);
  }

  // ─── Prometheus metrics ───────────────────────────────────────────────────
  pingChecksTotal.inc({ status: result.isUp ? 'up' : 'down' });
  pingResponseTime.observe(result.responseTimeMs);

  const statusIcon = result.isUp ? '✅' : '❌';
  logger.debug(
    `${statusIcon} [${monitor.name}] ${monitor.url} → ${result.statusCode ?? result.error} (${result.responseTimeMs}ms)`
  );
}

/**
 * Register a cron job for a monitor.
 * Uses a fixed interval (every N seconds) approach via a 1-second cron tick.
 */
function registerMonitor(monitor) {
  if (!monitor.isActive) return;
  if (activeTasks.has(String(monitor._id || monitor.id))) {
    unregisterMonitor(String(monitor._id || monitor.id));
  }

  const intervalSec = monitor.intervalSeconds || 60;
  // node-cron only supports per-minute granularity, so we use setInterval for sub-minute
  const intervalMs = intervalSec * 1000;

  const task = setInterval(() => {
    pingMonitor(monitor).catch((err) =>
      logger.error(`Unhandled ping error for ${monitor.url}: ${err.message}`)
    );
  }, intervalMs);

  activeTasks.set(String(monitor._id || monitor.id), task);
  logger.info(`📡 Registered monitor: [${monitor.name}] — every ${intervalSec}s`);

  // Run first check immediately (don't wait for the first interval)
  pingMonitor(monitor).catch((err) =>
    logger.error(`Initial ping error for ${monitor.url}: ${err.message}`)
  );
}

/** Stop the cron job for a monitor */
function unregisterMonitor(monitorId) {
  const task = activeTasks.get(String(monitorId));
  if (task) {
    clearInterval(task);
    activeTasks.delete(String(monitorId));
    logger.info(`🗑️  Unregistered monitor: ${monitorId}`);
  }
}

/**
 * Boot the ping service: load all active monitors from DB and register their tasks.
 * Called once at server startup.
 */
async function initPingService() {
  try {
    const monitors = await Monitor.find({ isActive: true });
    logger.info(`🚀 Ping service: loading ${monitors.length} active monitors…`);
    for (const monitor of monitors) {
      registerMonitor(monitor);
    }
    activeMonitorsGauge.set(monitors.length);
    logger.info('✅  Ping service initialized.');
  } catch (err) {
    logger.error(`Failed to initialize ping service: ${err.message}`);
  }
}

/** Return count of currently scheduled tasks */
function getActiveCount() {
  return activeTasks.size;
}

module.exports = { initPingService, registerMonitor, unregisterMonitor, getActiveCount };
