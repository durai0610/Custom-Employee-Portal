const asyncHandler = require('express-async-handler');
const { Permission } = require('../../models');
const { logAudit } = require('../../services/auditService');
const { AppError } = require('../../middleware/errorHandler');

// GET /api/admin/permissions
const listPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.findAll({ order: [['name', 'ASC']] });
  res.status(200).json({ permissions });
});

// POST /api/admin/permissions
const createPermission = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await Permission.findOne({ where: { name } });
  if (existing) throw new AppError('A permission with this name already exists', 409);

  const permission = await Permission.create({ name, description });
  await logAudit(req, { action: 'PERMISSION_CREATED', resource: 'admin.permissions', details: { name } });
  res.status(201).json({ permission });
});

module.exports = { listPermissions, createPermission };
