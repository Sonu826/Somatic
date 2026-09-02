const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');
const { logger } = require('./src/utils/logger');

async function start() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`SOMATIC backend listening on port ${env.PORT}`, {
      env: env.NODE_ENV,
      mockIot: env.MOCK_IOT,
      mockMl: env.MOCK_ML,
    });
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason: reason?.message || reason });
  });
}

start();
