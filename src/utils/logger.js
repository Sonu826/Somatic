const winston = require('winston');
const env = require('../config/env');

/**
 * Application-wide logger.
 *
 * IMPORTANT: never log passwords, JWT secrets, or API keys.
 * Callers should pass structured metadata (testId, cowId, timestamp, etc.)
 * rather than string-concatenating sensitive payloads.
 */
const logger = winston.createLogger({
  level: env.isProduction() ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.isProduction()
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${level}] ${message}${metaStr}`;
          })
        ),
  ),
  transports: [new winston.transports.Console()],
});

/**
 * Convenience helper for the standardized pipeline-stage events
 * described in the project spec (TEST_CREATED, SENSOR_DATA_RECEIVED, etc.)
 */
function logStage(stage, meta = {}) {
  logger.info(stage, meta);
}

module.exports = { logger, logStage };
