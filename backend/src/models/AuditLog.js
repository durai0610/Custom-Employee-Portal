module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        // Nullable: failed logins may not resolve to a real user id.
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'SET NULL',
      },
      action: {
        // e.g. LOGIN_SUCCESS, LOGIN_FAILED, USER_CREATED, ZOHO_ACCESS_DENIED
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      resource: {
        // e.g. "auth", "users", "zoho.crm"
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'AuditLogs',
      updatedAt: false, // audit logs are immutable
      indexes: [
        { fields: ['userId'] },
        { fields: ['action'] },
        { fields: ['timestamp'] },
      ],
    }
  );

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return AuditLog;
};
