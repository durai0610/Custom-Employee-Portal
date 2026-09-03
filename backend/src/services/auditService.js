const { AuditLog } = require('../models');

/**
 * Writes an audit log entry. Accepts the Express `req` (to pull userId/IP/
 * user-agent automatically) plus the event-specific fields. Failures to log
 * are swallowed (logged to console) so that audit logging can never break
 * the actual request.
 */
async function logAudit(req, { action, resource = null, details = null, userId = null }) {
  try {
    await AuditLog.create({
      userId: userId || req.user?.id || null,
      action,
      resource,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      userAgent: req.headers['user-agent'] || null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit };
