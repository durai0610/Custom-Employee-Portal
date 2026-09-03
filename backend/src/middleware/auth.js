const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, Role, Permission } = require('../models');
const { logAudit } = require('../services/auditService');

/**
 * Verifies the Bearer access token, loads the user's current roles and
 * permissions from the database (not just what was in the token, so a
 * revoked/changed role takes effect immediately), and attaches it all to
 * req.user. Rejects missing, malformed, expired, or invalid tokens with 401.
 */
async function authenticateToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwt.accessSecret);
    } catch (err) {
      const message = err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token';
      return res.status(401).json({ error: message });
    }

    const user = await User.findByPk(payload.sub, {
      include: [{ model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] }],
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User no longer active' });
    }

    const roles = user.roles.map((r) => r.name);
    const permissions = Array.from(
      new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name)))
    );

    req.user = { id: user.id, name: user.name, email: user.email, roles, permissions };
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Allows the request through only if req.user has at least one of the given roles. */
function authorizeRoles(...allowedRoles) {
  return async (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const isAllowed = userRoles.includes('Admin') || userRoles.some((r) => allowedRoles.includes(r));

    if (!isAllowed) {
      await logAudit(req, {
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: req.originalUrl,
        details: { requiredRoles: allowedRoles, userRoles },
      });
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    return next();
  };
}

/** Allows the request through only if req.user has ALL of the given permissions. */
function authorizePermissions(...requiredPermissions) {
  return async (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    const isAdmin = (req.user?.roles || []).includes('Admin');
    const hasAll = isAdmin || requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasAll) {
      await logAudit(req, {
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: req.originalUrl,
        details: { requiredPermissions, userPermissions },
      });
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    return next();
  };
}

module.exports = { authenticateToken, authorizeRoles, authorizePermissions };
