'use strict';

process.env.PORT = '5003';
process.env.MONGODB_URI = 'mongodb://localhost:27017/cloudpulse_test';
process.env.JWT_SECRET = 'test_secret_minimum_32_chars_long_abc';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.MONITOR_INTERVAL_SECONDS = '60';

const request = require('supertest');
const Monitor = require('../models/Monitor');
const PingResult = require('../models/PingResult');
const app = require('../app');

describe('Public Status API', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('GET /api/status/public returns public health summary without auth', async () => {
    const mockMonitors = [
      {
        _id: '6645a1b2c3d4e5f6a7b8c9d0',
        name: 'Google Production',
        url: 'https://google.com',
        isUp: true,
        lastResponseTimeMs: 85,
        uptimePercentage: 99.9,
        lastCheckedAt: new Date(),
      },
    ];

    const mockHistory = [
      {
        _id: '6645a1b2c3d4e5f6a7b8c9d0',
        recentPings: [
          { isUp: true, responseTimeMs: 85, checkedAt: new Date() },
        ],
      },
    ];

    jest.spyOn(Monitor, 'find').mockReturnValue({
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockMonitors),
    });

    jest.spyOn(PingResult, 'aggregate').mockResolvedValue(mockHistory);

    const res = await request(app)
      .get('/api/status/public')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.systemStatus).toBe('operational');
    expect(res.body.data.summary.total).toBe(1);
    expect(res.body.data.summary.operationalCount).toBe(1);
    expect(res.body.data.summary.downCount).toBe(0);
    expect(res.body.data.monitors.length).toBe(1);
    expect(res.body.data.monitors[0].name).toBe('Google Production');
  });
});
