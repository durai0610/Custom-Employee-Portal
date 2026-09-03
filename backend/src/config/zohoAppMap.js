// Single source of truth for which Zoho application each role may access.
// Both GET /api/apps and the Zoho proxy routes read from this file, so
// there is exactly one place that defines the mapping (no duplicated
// authorization logic between "what the dashboard shows" and "what the
// backend actually allows").
const ZOHO_APPS = {
  people: { key: 'people', name: 'Zoho People', description: 'HR management' },
  crm: { key: 'crm', name: 'Zoho CRM', description: 'Sales & customer relationship management' },
  desk: { key: 'desk', name: 'Zoho Desk', description: 'Support ticketing & case management' },
  books: { key: 'books', name: 'Zoho Books', description: 'Financial & accounting operations' },
};

// Role name -> array of Zoho app keys that role may access.
// "Admin" is handled specially (all apps) wherever this map is consumed.
const ROLE_APP_MAP = {
  Admin: Object.keys(ZOHO_APPS),
  HR: ['people'],
  Sales: ['crm'],
  Support: ['desk'],
  Finance: ['books'],
};

function appsForRoles(roleNames = []) {
  const keys = new Set();
  roleNames.forEach((roleName) => {
    (ROLE_APP_MAP[roleName] || []).forEach((k) => keys.add(k));
  });
  return Array.from(keys).map((k) => ZOHO_APPS[k]);
}

function isAppAuthorizedForRoles(appKey, roleNames = []) {
  return roleNames.some((roleName) => (ROLE_APP_MAP[roleName] || []).includes(appKey));
}

module.exports = { ZOHO_APPS, ROLE_APP_MAP, appsForRoles, isAppAuthorizedForRoles };
