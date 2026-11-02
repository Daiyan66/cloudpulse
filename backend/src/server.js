'use strict';

require('./config/env'); // Validate env vars first

const connectDB = require('./config/db');
const app = require('./app');
const { port } = require('./config/env');
const logger = require('./utils/logger');
const { initPingService } = require('./services/pingService');

async function bootstrap() {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    // 2. Start HTTP server
    const server = app.listen(port, () => {
      logger.info(`🚀  CloudPulse API running on http://localhost:${port}`);
      logger.info(`📊  Metrics:      http://localhost:${port}/metrics`);
      logger.info(`❤️   Health:       http://localhost:${port}/health`);
    });

    // 3. Start ping engine (after server is up so health checks pass)
    await initPingService();

    // ─── Graceful shutdown ────────────────────────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down gracefully…`);
      server.close(async () => {
        const mongoose = require('mongoose');
        await mongoose.disconnect();
        logger.info('MongoDB disconnected. Goodbye! 👋');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    // Catch unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
    });

  } catch (err) {
    logger.error('Fatal error during bootstrap:', err);
    process.exit(1);
  }
}

bootstrap();
