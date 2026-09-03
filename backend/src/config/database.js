const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? false : false,
  dialectOptions: env.dbSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  define: {
    underscored: false,
    timestamps: true,
  },
});

module.exports = sequelize;
