const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { sendSuccess } = require('./utils/apiResponse');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// ---- Core security / parsing middleware ----
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Logging ----
app.use(morgan(env.isProduction() ? 'combined' : 'dev'));

// ---- Rate limiting (auth endpoints are the most sensitive to brute force) ----
const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errorCode: 'RATE_LIMITED',
  },
});
app.use('/api/auth', authLimiter);

// ---- Health check ----
app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok', env: env.NODE_ENV, mockIot: env.MOCK_IOT, mockMl: env.MOCK_ML });
});

// ---- Route mounting ----
// Routes are added module-by-module as each development phase lands.
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cows', require('./routes/cowRoutes'));

// Phase 4 will add: app.use('/api/tests', require('./routes/testRoutes'));
// ...and so on through /api/iot, /api/ml, /api/risk,
// /api/dashboard, /api/alerts, /api/farm, /api/reports.

// ---- 404 + centralized error handling (must stay last) ----
app.use(notFoundMiddleware);
app.use(errorMiddleware);


// Inside src/app.js:
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/observations', require('./routes/observationRoutes'));


app.use('/api/iot', require('./routes/iotRoutes'));




module.exports = app;
