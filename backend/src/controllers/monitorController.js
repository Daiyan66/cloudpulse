'use strict';

const Monitor = require('../models/Monitor');
const PingResult = require('../models/PingResult');
const asyncHandler = require('../utils/asyncHandler');
const { createError } = require('../middleware/errorHandler');
const { activeMonitorsGauge } = require('../utils/metrics');
const pingService = require('../services/pingService');

// ─── GET /api/monitors ────────────────────────────────────────────────────────
exports.getMonitors = asyncHandler(async (req, res) => {
  const monitors = await Monitor.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, count: monitors.length, data: monitors });
});

// ─── POST /api/monitors ───────────────────────────────────────────────────────
exports.createMonitor = asyncHandler(async (req, res) => {
  const { name, url, intervalSeconds } = req.body;

  const monitor = await Monitor.create({
    user: req.user.id,
    name,
    url,
    intervalSeconds: intervalSeconds || 60,
  });

  // Register the cron job immediately so first check happens without waiting
  pingService.registerMonitor(monitor);
  activeMonitorsGauge.inc();

  res.status(201).json({ success: true, data: monitor });
});

// ─── GET /api/monitors/:id ────────────────────────────────────────────────────
exports.getMonitor = asyncHandler(async (req, res, next) => {
  const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user.id });
  if (!monitor) return next(createError('Monitor not found.', 404));
  res.json({ success: true, data: monitor });
});

// ─── PUT /api/monitors/:id ────────────────────────────────────────────────────
exports.updateMonitor = asyncHandler(async (req, res, next) => {
  const { name, url, intervalSeconds, isActive } = req.body;

  const monitor = await Monitor.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { name, url, intervalSeconds, isActive },
    { new: true, runValidators: true }
  );

  if (!monitor) return next(createError('Monitor not found.', 404));

  // Re-register the cron job with new interval / active state
  pingService.unregisterMonitor(monitor.id);
  if (monitor.isActive) {
    pingService.registerMonitor(monitor);
  }

  res.json({ success: true, data: monitor });
});

// ─── DELETE /api/monitors/:id ─────────────────────────────────────────────────
exports.deleteMonitor = asyncHandler(async (req, res, next) => {
  const monitor = await Monitor.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!monitor) return next(createError('Monitor not found.', 404));

  await PingResult.deleteMany({ monitor: monitor._id });
  pingService.unregisterMonitor(monitor.id);
  activeMonitorsGauge.dec();

  res.json({ success: true, message: 'Monitor deleted.' });
});

// ─── GET /api/monitors/:id/history ───────────────────────────────────────────
exports.getHistory = asyncHandler(async (req, res, next) => {
  const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user.id });
  if (!monitor) return next(createError('Monitor not found.', 404));

  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const results = await PingResult.find({ monitor: monitor._id })
    .sort({ checkedAt: -1 })
    .limit(limit)
    .lean();

  res.json({ success: true, count: results.length, data: results });
});

// ─── GET /api/monitors/:id/stats ─────────────────────────────────────────────
exports.getStats = asyncHandler(async (req, res, next) => {
  const monitor = await Monitor.findOne({ _id: req.params.id, user: req.user.id });
  if (!monitor) return next(createError('Monitor not found.', 404));

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

  const [agg] = await PingResult.aggregate([
    { $match: { monitor: monitor._id, checkedAt: { $gte: since } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        upCount: { $sum: { $cond: ['$isUp', 1, 0] } },
        avgResponseTime: { $avg: '$responseTimeMs' },
        minResponseTime: { $min: '$responseTimeMs' },
        maxResponseTime: { $max: '$responseTimeMs' },
      },
    },
  ]);

  const stats = agg
    ? {
        total: agg.total,
        upCount: agg.upCount,
        downCount: agg.total - agg.upCount,
        uptimePercentage: +((agg.upCount / agg.total) * 100).toFixed(2),
        avgResponseTimeMs: Math.round(agg.avgResponseTime),
        minResponseTimeMs: agg.minResponseTime,
        maxResponseTimeMs: agg.maxResponseTime,
      }
    : { total: 0, upCount: 0, downCount: 0, uptimePercentage: null };

  res.json({ success: true, data: { monitor, stats } });
});
