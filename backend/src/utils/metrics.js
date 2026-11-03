'use strict';

const promClient = require('prom-client');

// Collect default system metrics (CPU, memory, event loop lag, etc.)
promClient.collectDefaultMetrics({ prefix: 'cloudpulse_' });

// ─── Custom Metrics ───────────────────────────────────────────────────────────

/** Counts HTTP requests by method, route, and status */
const httpRequestsTotal = new promClient.Counter({
  name: 'cloudpulse_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

/** Histogram of HTTP response durations */
const httpRequestDuration = new promClient.Histogram({
  name: 'cloudpulse_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

/** Gauge for currently active monitors */
const activeMonitorsGauge = new promClient.Gauge({
  name: 'cloudpulse_active_monitors_total',
  help: 'Number of currently active URL monitors',
});

/** Counter for ping checks performed */
const pingChecksTotal = new promClient.Counter({
  name: 'cloudpulse_ping_checks_total',
  help: 'Total number of URL ping checks performed',
  labelNames: ['status'], // 'up' | 'down'
});

/** Histogram of URL response times */
const pingResponseTime = new promClient.Histogram({
  name: 'cloudpulse_ping_response_time_ms',
  help: 'Response time of URL pings in milliseconds',
  buckets: [50, 100, 200, 500, 1000, 2000, 5000],
});

/** Counter for incoming Alertmanager alerts */
const alertsReceivedTotal = new promClient.Counter({
  name: 'cloudpulse_alerts_received_total',
  help: 'Total number of alerts received from Alertmanager',
  labelNames: ['status', 'severity', 'alertname'],
});

module.exports = {
  register: promClient.register,
  httpRequestsTotal,
  httpRequestDuration,
  activeMonitorsGauge,
  pingChecksTotal,
  pingResponseTime,
  alertsReceivedTotal,
};
