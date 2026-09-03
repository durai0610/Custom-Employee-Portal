'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AuditLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'SET NULL',
      },
      action: { type: Sequelize.STRING(80), allowNull: false },
      resource: { type: Sequelize.STRING(120), allowNull: true },
      details: { type: Sequelize.JSONB, allowNull: true },
      ipAddress: { type: Sequelize.STRING(64), allowNull: true },
      userAgent: { type: Sequelize.STRING(255), allowNull: true },
      timestamp: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('AuditLogs', ['userId']);
    await queryInterface.addIndex('AuditLogs', ['action']);
    await queryInterface.addIndex('AuditLogs', ['timestamp']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('AuditLogs');
  },
};
