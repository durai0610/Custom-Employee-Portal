'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserRoles', {
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      roleId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Roles', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    // (userId, roleId) is already the primary key, which Postgres backs with
    // a unique index automatically — no separate unique index is needed.
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('UserRoles');
  },
};
