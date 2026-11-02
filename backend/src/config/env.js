'use strict';

require('dotenv').config();

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongodbUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  monitorIntervalSeconds: parseInt(process.env.MONITOR_INTERVAL_SECONDS, 10) || 60,
};
