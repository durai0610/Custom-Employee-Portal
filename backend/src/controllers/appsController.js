const asyncHandler = require('express-async-handler');
const { appsForRoles } = require('../config/zohoAppMap');
const { isDemoMode } = require('../services/zohoService');

// GET /api/apps
// Returns only the Zoho applications the logged-in user's roles authorize.
// This is the backend's authoritative answer — the frontend must not
// compute this itself.
const getMyApps = asyncHandler(async (req, res) => {
  const apps = appsForRoles(req.user.roles);
  return res.status(200).json({ apps, demoMode: isDemoMode() });
});

module.exports = { getMyApps };
