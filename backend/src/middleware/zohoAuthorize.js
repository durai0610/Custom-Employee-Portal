const { isAppAuthorizedForRoles } = require('../config/zohoAppMap');
const { logAudit } = require('../services/auditService');

/**
 * Given the Zoho app key for a route (people/crm/desk/books), verifies the
 * authenticated user's roles actually authorize that application before
 * the request is allowed to proceed to the Zoho proxy handler. This is the
 * step that makes rule "backend must return 403" real: it runs on every
 * request, independent of anything the frontend rendered or hid.
 */
function requireZohoApp(appKey) {
  return async (req, res, next) => {
    const authorized = isAppAuthorizedForRoles(appKey, req.user.roles);

    if (!authorized) {
      await logAudit(req, {
        action: 'ZOHO_ACCESS_DENIED',
        resource: `zoho.${appKey}`,
        details: { userRoles: req.user.roles },
      });
      return res.status(403).json({ error: `Forbidden: your role does not grant access to Zoho ${appKey}` });
    }

    await logAudit(req, { action: 'ZOHO_SERVICE_ACCESS', resource: `zoho.${appKey}` });
    return next();
  };
}

module.exports = { requireZohoApp };
