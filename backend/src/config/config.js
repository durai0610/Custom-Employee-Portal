// sequelize-cli configuration. sequelize-cli cannot read env.js directly
// (it expects a plain config module), so we parse DATABASE_URL here too.
require('dotenv').config();

const useSsl = process.env.DB_SSL === 'true';

const base = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres',
  logging: false,
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

module.exports = {
  development: base,
  test: { ...base, url: process.env.TEST_DATABASE_URL || base.url },
  production: base,
};
