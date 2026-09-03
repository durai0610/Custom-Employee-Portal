const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { User, Role, Permission, sequelize } = require('../../models');
const { logAudit } = require('../../services/auditService');
const { AppError } = require('../../middleware/errorHandler');

const userInclude = [{ model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] }];

function serialize(user) {
  return { ...user.toSafeJSON(), roles: user.roles.map((r) => ({ id: r.id, name: r.name })) };
}

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({ include: userInclude, order: [['createdAt', 'DESC']] });
  res.status(200).json({ users: users.map(serialize) });
});

// POST /api/admin/users
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, roleIds = [] } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new AppError('A user with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await sequelize.transaction(async (t) => {
    const created = await User.create({ name, email, passwordHash }, { transaction: t });
    if (roleIds.length) {
      const roles = await Role.findAll({ where: { id: roleIds }, transaction: t });
      await created.setRoles(roles, { transaction: t });
    }
    return created;
  });

  const full = await User.findByPk(user.id, { include: userInclude });

  await logAudit(req, { action: 'USER_CREATED', resource: 'admin.users', details: { userId: user.id, email } });
  res.status(201).json({ user: serialize(full) });
});

// PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, isActive, roleIds } = req.body;

  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found', 404);

  if (email && email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new AppError('A user with this email already exists', 409);
  }

  await sequelize.transaction(async (t) => {
    await user.update(
      {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      { transaction: t }
    );
    if (roleIds !== undefined) {
      const roles = await Role.findAll({ where: { id: roleIds }, transaction: t });
      await user.setRoles(roles, { transaction: t });
    }
  });

  const full = await User.findByPk(id, { include: userInclude });
  await logAudit(req, { action: 'USER_UPDATED', resource: 'admin.users', details: { userId: id } });
  res.status(200).json({ user: serialize(full) });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found', 404);

  await user.destroy();
  await logAudit(req, { action: 'USER_DELETED', resource: 'admin.users', details: { userId: id } });
  res.status(200).json({ message: 'User deleted' });
});

module.exports = { listUsers, createUser, updateUser, deleteUser };
