/**
 * Centralized environment configuration.
 *
 * Nothing else in the codebase should call `process.env` directly.
 * Import from here instead, so env access is validated in one place
 * and easy to audit / change.
 */
require('dotenv').config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Fail fast at boot rather than deep inside a request handler.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function bool(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  MONGO_URI: required('MONGO_URI', 'mongodb://localhost:27017/somatic'),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  ML_API_URL: process.env.ML_API_URL || 'http://localhost:6000',
  ML_API_KEY: process.env.ML_API_KEY || '',
  ML_TIMEOUT_MS: parseInt(process.env.ML_TIMEOUT_MS || '8000', 10),

  MOCK_IOT: bool('MOCK_IOT', true),
  MOCK_ML: bool('MOCK_ML', true),

  AUTH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),

  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',

  isProduction: () => env.NODE_ENV === 'production',
};

module.exports = env;
