'use strict';

const { httpRequestsTotal, httpRequestDuration } = require('../utils/metrics');

/**
 * Records HTTP request count and duration for every request.
 * Attaches to Express via app.use() before routes.
 */
const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode,
    };
    httpRequestsTotal.inc(labels);
    end(labels);
  });

  next();
};

module.exports = metricsMiddleware;
