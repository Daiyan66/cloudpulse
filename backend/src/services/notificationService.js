'use strict';

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Dispatch down / recovery alert notifications.
 *
 * @param {Object} monitor - Monitor mongoose doc
 * @param {string} event - 'DOWN' | 'RECOVERED'
 * @param {Object} details - { statusCode, responseTimeMs, error }
 */
async function sendMonitorAlert(monitor, event, details = {}) {
  const isDown = event === 'DOWN';
  const icon = isDown ? '🚨' : '✅';
  const statusText = isDown ? 'DOWN' : 'OPERATIONAL';

  logger.warn(
    `${icon} [Alert Dispatch] Monitor "${monitor.name}" (${monitor.url}) is now ${statusText}`
  );

  const payload = {
    event,
    monitor: {
      id: monitor._id || monitor.id,
      name: monitor.name,
      url: monitor.url,
    },
    status: statusText,
    timestamp: new Date().toISOString(),
    details: {
      statusCode: details.statusCode || null,
      responseTimeMs: details.responseTimeMs || 0,
      error: details.error || null,
    },
    // Formatted for Slack / Discord / Webhook compatibility
    text: `${icon} *CloudPulse Alert:* Monitor *${monitor.name}* (<${monitor.url}>) is *${statusText}*! ` +
          (isDown ? `Error: ${details.error || `HTTP ${details.statusCode}`}` : `Response time: ${details.responseTimeMs}ms`),
  };

  // 1. Send to monitor's configured Webhook URL (if any)
  if (monitor.alertWebhookUrl) {
    try {
      await axios.post(monitor.alertWebhookUrl, payload, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'CloudPulse-Alerts/1.0' },
      });
      logger.info(`📨 Webhook notification sent for monitor "${monitor.name}"`);
    } catch (err) {
      logger.error(`❌ Failed to send alert webhook for "${monitor.name}": ${err.message}`);
    }
  }

  // 2. Email notification placeholder (logs or integrates with SMTP/SES/Sendgrid)
  if (monitor.alertEmail) {
    logger.info(`📧 [Simulated Email] Sent ${event} alert for "${monitor.name}" to ${monitor.alertEmail}`);
  }
}

module.exports = { sendMonitorAlert };
