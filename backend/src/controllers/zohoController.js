const asyncHandler = require('express-async-handler');
const { callZohoApi } = require('../services/zohoService');

/**
 * Generic proxy handler factory for a given Zoho module. Authorization has
 * already been enforced by requireZohoApp() middleware before this runs.
 * `zohoPathPrefix` is the real Zoho REST path for that module; any extra
 * path segments the portal user requested are appended after it.
 */
function makeZohoProxyHandler(appKey, zohoPathPrefix) {
  return asyncHandler(async (req, res) => {
    const extraPath = req.params[0] ? `/${req.params[0]}` : '';
    const data = await callZohoApi(appKey, `${zohoPathPrefix}${extraPath}`, {
      method: req.method,
      params: req.query,
      data: req.body,
    });
    return res.status(200).json(data);
  });
}

module.exports = {
  peopleProxy: makeZohoProxyHandler('people', '/people/api/forms/employee/records'),
  crmProxy: makeZohoProxyHandler('crm', '/crm/v5/Leads'),
  deskProxy: makeZohoProxyHandler('desk', '/desk/v2/tickets'),
  booksProxy: makeZohoProxyHandler('books', '/books/v3/invoices'),
};
