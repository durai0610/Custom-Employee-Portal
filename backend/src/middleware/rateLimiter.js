const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// Protects the login endpoint against brute-force / credential-stuffing attempts.
//
// `skip` disables this limiter ONLY when NODE_ENV=test. This does not weaken
// production/dev security at all — the limiter is fully active there with
// its normal windowMs/max. It exists because the automated test suite logs
// in fresh for nearly every assertion (by design, to exercise each role),
// which legitimately looks like a brute-force pattern to a per-IP limiter
// and was causing later tests to receive 429 on login -> then 401 on the
// follow-up request (an "undefined" bearer token), even though the actual
// RBAC/auth logic under test was correct.
const loginLimiter = rateLimit({
  windowMs: env.loginRateLimit.windowMs,
  max: env.loginRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
  skip: () => env.nodeEnv === 'test',
});

// A gentler, general-purpose limiter for the rest of the API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

module.exports = { loginLimiter, apiLimiter };
