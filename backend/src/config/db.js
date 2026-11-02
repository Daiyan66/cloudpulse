'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { mongodbUri } = require('./env');

const MAX_RETRIES = 5;
let retries = 0;

/**
 * Connect to MongoDB Atlas with automatic retry on failure.
 * Exported so server.js can await it before listening.
 */
async function connectDB() {
  try {
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logger.info('✅  MongoDB Atlas connected successfully');
    retries = 0; // reset on success
  } catch (err) {
    retries += 1;
    logger.error(`❌  MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${err.message}`);

    if (retries >= MAX_RETRIES) {
      logger.error('Max retries reached. Exiting.');
      process.exit(1);
    }
    const delay = retries * 2000; // exponential-ish back-off
    logger.info(`Retrying in ${delay / 1000}s…`);
    await new Promise((r) => setTimeout(r, delay));
    return connectDB();
  }
}

// ─── Connection lifecycle events ─────────────────────────────────────────────
mongoose.connection.on('disconnected', () =>
  logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect…')
);
mongoose.connection.on('reconnected', () =>
  logger.info('🔄  MongoDB reconnected.')
);
mongoose.connection.on('error', (err) =>
  logger.error('MongoDB connection error:', err)
);

module.exports = connectDB;
