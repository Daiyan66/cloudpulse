'use strict';

const { Router } = require('express');
const Monitor = require('../models/Monitor');
const PingResult = require('../models/PingResult');
const asyncHandler = require('../utils/asyncHandler');

const router = Router();

/**
 * GET /api/status/public
 * Unauthenticated public status page data
 */
router.get('/public', asyncHandler(async (_req, res) => {
  const monitors = await Monitor.find({ isActive: true, isPublic: true })
    .select('name url isUp lastResponseTimeMs uptimePercentage lastCheckedAt createdAt')
    .sort({ name: 1 })
    .lean();

  const total = monitors.length;
  const operationalCount = monitors.filter((m) => m.isUp === true).length;
  const downCount = monitors.filter((m) => m.isUp === false).length;

  let systemStatus = 'operational';
  if (downCount > 0) {
    systemStatus = downCount === total ? 'major_outage' : 'degraded';
  } else if (total === 0) {
    systemStatus = 'operational';
  }

  // Fetch recent 24h stats for each monitor
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const monitorIds = monitors.map((m) => m._id);

  const history = await PingResult.aggregate([
    { $match: { monitor: { $in: monitorIds }, checkedAt: { $gte: since24h } } },
    { $sort: { checkedAt: -1 } },
    {
      $group: {
        _id: '$monitor',
        recentPings: {
          $push: {
            isUp: '$isUp',
            responseTimeMs: '$responseTimeMs',
            checkedAt: '$checkedAt',
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        recentPings: { $slice: ['$recentPings', 30] }, // last 30 pings for mini sparklines
      },
    },
  ]);

  const historyMap = new Map(history.map((h) => [String(h._id), h.recentPings]));

  const monitorsWithHistory = monitors.map((m) => ({
    id: m._id,
    name: m.name,
    url: m.url,
    isUp: m.isUp,
    lastResponseTimeMs: m.lastResponseTimeMs,
    uptimePercentage: m.uptimePercentage,
    lastCheckedAt: m.lastCheckedAt,
    recentPings: historyMap.get(String(m._id)) || [],
  }));

  res.json({
    success: true,
    data: {
      systemStatus,
      summary: {
        total,
        operationalCount,
        downCount,
      },
      updatedAt: new Date().toISOString(),
      monitors: monitorsWithHistory,
    },
  });
}));

module.exports = router;
