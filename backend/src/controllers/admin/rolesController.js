const asyncHandler = require('express-async-handler');
const { Role, Permission, User, sequelize } = require('../../models');
const { logAudit } = require('../../services/auditService');
const { AppError } = require('../../middleware/errorHandler');

const roleInclude = [{ model: Permission, as: 'permissions' }];

function serialize(role) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions.map((p) => ({ id: p.id, name: p.name })),
  };
}

// GET /api/admin/roles
const listRoles = asyncHandler(async (req, res) => {
  const roles = await Role.findAll({ include: roleInclude, order: [['name', 'ASC']] });
  res.status(200).json({ roles: roles.map(serialize) });
});

// POST /api/admin/roles
const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissionIds = [] } = req.body;

  const existing = await Role.findOne({ where: { name } });
  if (existing) throw new AppError('A role with this name already exists', 409);

  const role = await sequelize.transaction(async (t) => {
    const created = await Role.create({ name, description }, { transaction: t });
    if (permissionIds.length) {
      const permissions = await Permission.findAll({ where: { id: permissionIds }, transaction: t });
      await created.setPermissions(permissions, { transaction: t });
    }
    return created;
  });

  const full = await Role.findByPk(role.id, { include: roleInclude });
  await logAudit(req, { action: 'ROLE_CREATED', resource: 'admin.roles', details: { roleId: role.id, name } });
  res.status(201).json({ role: serialize(full) });
});

// PUT /api/admin/roles/:id
const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, permissionIds } = req.body;

  const role = await Role.findByPk(id);
  if (!role) throw new AppError('Role not found', 404);

  await sequelize.transaction(async (t) => {
    await role.update(
      { ...(name !== undefined ? { name } : {}), ...(description !== undefined ? { description } : {}) },
      { transaction: t }
    );
    if (permissionIds !== undefined) {
      const permissions = await Permission.findAll({ where: { id: permissionIds }, transaction: t });
      await role.setPermissions(permissions, { transaction: t });
    }
  });

  const full = await Role.findByPk(id, { include: roleInclude });
  await logAudit(req, { action: 'ROLE_PERMISSIONS_UPDATED', resource: 'admin.roles', details: { roleId: id } });
  res.status(200).json({ role: serialize(full) });
});

// DELETE /api/admin/roles/:id
// Refuses to delete a role that is still assigned to users, and refuses to
// delete the built-in Admin role — both are "delete where safe" guards.
const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await Role.findByPk(id);
  if (!role) throw new AppError('Role not found', 404);

  if (role.name === 'Admin') {
    throw new AppError('The Admin role cannot be deleted', 400);
  }

  const assignedCount = await role.countUsers();
  if (assignedCount > 0) {
    throw new AppError('Cannot delete a role that is still assigned to users', 409);
  }

  await role.destroy();
  await logAudit(req, { action: 'ROLE_DELETED', resource: 'admin.roles', details: { roleId: id } });
  res.status(200).json({ message: 'Role deleted' });
});

module.exports = { listRoles, createRole, updateRole, deleteRole };
