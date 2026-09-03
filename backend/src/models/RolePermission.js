module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    'RolePermission',
    {
      // Composite primary key (roleId, permissionId) — see UserRole.js for
      // the full explanation. Same fix, same reasoning, applied here too.
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Roles', key: 'id' },
        onDelete: 'CASCADE',
      },
      permissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Permissions', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'RolePermissions',
      // No extra unique index needed: the composite primary key above
      // already guarantees (roleId, permissionId) is unique at the database level.
    }
  );

  return RolePermission;
};
