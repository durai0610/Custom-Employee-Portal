// Centralizes access to environment variables so the rest of the codebase
// never reads process.env directly. Makes it obvious what config the app
// depends on and gives us one place to add validation later.
require('dotenv').config();

const required = (name, fallback = undefined) => {
  const value = process.env[name] ?? fallback;
  return value;
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  backendUrl: required('BACKEND_URL', 'http://localhost:5000'),
  frontendUrl: required('FRONTEND_URL', 'http://localhost:5173'),

  databaseUrl: required('DATABASE_URL'),
  dbSsl: process.env.DB_SSL === 'true',

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cookieSecure: process.env.COOKIE_SECURE === 'true',

  loginRateLimit: {
    windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '10', 10),
  },

  zoho: {
    clientId: process.env.ZOHO_CLIENT_ID || '',
    clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
    refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com',
    apiBaseUrl: process.env.ZOHO_API_BASE_URL || 'https://www.zohoapis.com',
    get isConfigured() {
      return Boolean(this.clientId && this.clientSecret && this.refreshToken);
    },
  },

  demoPassword: process.env.DEMO_PASSWORD || 'Passw0rd!123',
};
