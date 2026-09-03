const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { AuditLog, User } = require('../../models');

// GET /api/admin/audit-logs?action=&userId=&from=&to=&page=&pageSize=
const listAuditLogs = asyncHandler(async (req, res) => {
  const { action, userId, from, to } = req.query;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '25', 10), 1), 100);

  const where = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp[Op.gte] = new Date(from);
    if (to) where.timestamp[Op.lte] = new Date(to);
  }

  const { rows, count } = await AuditLog.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['timestamp', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  res.status(200).json({
    logs: rows,
    pagination: { page, pageSize, total: count, totalPages: Math.ceil(count / pageSize) },
  });
});

module.exports = { listAuditLogs };
