'use strict';

const { Router } = require('express');
const logger = require('../utils/logger');
const { alertsReceivedTotal } = require('../utils/metrics');

const router = Router();

/**
 * POST /api/alerts/webhook
 * Receives alerts forwarded from Alertmanager
 */
router.post('/webhook', (req, res) => {
  const { status, alerts = [], commonLabels = {}, commonAnnotations = {} } = req.body;

  logger.warn(
    `🚨 [Alertmanager Webhook] Status: ${status?.toUpperCase()} | Alerts count: ${alerts.length} | Alert: ${commonLabels.alertname || 'Unknown'}`
  );

  alerts.forEach((alert) => {
    const alertname = alert.labels?.alertname || 'unknown';
    const severity  = alert.labels?.severity || 'unknown';
    const alertStatus = alert.status || status || 'firing';

    alertsReceivedTotal.inc({
      status: alertStatus,
      severity,
      alertname,
    });

    const summary = alert.annotations?.summary || commonAnnotations.summary || 'No summary';
    const desc    = alert.annotations?.description || commonAnnotations.description || 'No description';

    if (alertStatus === 'resolved') {
      logger.info(`✅ [Resolved] ${alertname} (${severity}) - ${summary}`);
    } else {
      logger.error(`🔥 [Firing] ${alertname} (${severity}) - ${summary} - ${desc}`);
    }
  });

  res.status(200).json({
    success: true,
    message: 'Alerts processed successfully',
    processed: alerts.length,
  });
});

module.exports = router;
