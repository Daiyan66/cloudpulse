'use strict';

process.env.PORT = '5002';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudpulse_test';
process.env.JWT_SECRET = 'test_secret_minimum_32_chars_long_abc';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.MONITOR_INTERVAL_SECONDS = '60';

const request = require('supertest');
const app = require('../app');

describe('Alerts Webhook API', () => {
  it('should accept and process Alertmanager webhook payload', async () => {
    const payload = {
      status: 'firing',
      commonLabels: {
        alertname: 'ServiceDown',
        severity: 'critical',
      },
      commonAnnotations: {
        summary: 'Target service is down',
      },
      alerts: [
        {
          status: 'firing',
          labels: {
            alertname: 'ServiceDown',
            severity: 'critical',
            instance: 'backend:5000',
          },
          annotations: {
            summary: 'Service backend:5000 is down',
            description: 'Target backend:5000 has been unreachable for 1m',
          },
        },
      ],
    };

    const res = await request(app)
      .post('/api/alerts/webhook')
      .send(payload)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.processed).toBe(1);
  });

  it('should handle empty alert payload gracefully', async () => {
    const res = await request(app)
      .post('/api/alerts/webhook')
      .send({})
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.processed).toBe(0);
  });
});
