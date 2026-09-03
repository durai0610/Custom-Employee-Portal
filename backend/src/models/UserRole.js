module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    'UserRole',
    {
      // Composite primary key (userId, roleId) — this is a pure join table
      // with no identity of its own, so it does not get a surrogate id
      // column. Marking both columns primaryKey: true tells Sequelize the
      // model already has a primary key, so it will NOT silently add its
      // own implicit auto-increment "id" attribute (which is what caused
      // the original bug: the model didn't know about a real "id" column,
      // so it never sent one, and the database had nothing to fill it in
      // with either).
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Roles', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'UserRoles',
      // No extra unique index needed: the composite primary key above
      // already guarantees (userId, roleId) is unique at the database level.
    }
  );

  return UserRole;
};
