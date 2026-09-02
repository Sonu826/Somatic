const mongoose = require('mongoose');
const env = require('./env');
const { logger } = require('../utils/logger');

mongoose.set('strictQuery', true);

async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      // Modern mongoose (>=6) no longer needs useNewUrlParser/useUnifiedTopology,
      // kept explicit here for clarity to future maintainers.
      autoIndex: !env.isProduction(),
      // Fail fast instead of hanging for mongoose's 30s default — important
      // for a farm environment where we want clear, quick startup errors.
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('MongoDB connected', { host: conn.connection.host, db: conn.connection.name });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { message: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (err) {
    logger.error('MongoDB initial connection failed', { message: err.message });
    // Fail fast — the app is not useful without a database.
    process.exit(1);
  }
}

module.exports = connectDB;
