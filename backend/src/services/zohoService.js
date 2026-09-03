const axios = require('axios');
const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');

/**
 * Backend-only Zoho One integration using a single service account
 * (self-client refresh token flow — RFC-style OAuth2 refresh grant).
 *
 * - The refresh token, client id, and client secret NEVER leave this file.
 * - The access token is cached in memory and re-used until shortly before
 *   it expires, then transparently refreshed.
 * - If Zoho credentials are not configured (env.zoho.isConfigured === false)
 *   the service runs in DEMO MODE: it returns clearly-labeled mock data
 *   instead of pretending to call the real API. This lets the rest of the
 *   portal (RBAC, routing, UI) be demoed/reviewed without requiring a real
 *   Zoho One subscription.
 */

let cachedToken = null; // { accessToken, expiresAt }

async function getAccessToken() {
  if (!env.zoho.isConfigured) {
    return null; // signals demo mode to callers
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - now > 30_000) {
    return cachedToken.accessToken;
  }

  try {
    const response = await axios.post(
      `${env.zoho.accountsUrl}/oauth/v2/token`,
      null,
      {
        params: {
          refresh_token: env.zoho.refreshToken,
          client_id: env.zoho.clientId,
          client_secret: env.zoho.clientSecret,
          grant_type: 'refresh_token',
        },
      }
    );

    const { access_token: accessToken, expires_in: expiresIn } = response.data;
    if (!accessToken) {
      throw new AppError('Zoho did not return an access token', 502);
    }

    cachedToken = {
      accessToken,
      expiresAt: now + expiresIn * 1000,
    };
    return accessToken;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Zoho token refresh failed:', err.response?.data || err.message);
    throw new AppError('Failed to obtain Zoho access token', 502);
  }
}

/** DEMO MODE fallbacks — clearly labeled so nobody mistakes them for live Zoho data. */
const DEMO_DATA = {
  people: { _demoMode: true, module: 'Zoho People', message: 'Demo data — connect ZOHO_* env vars for live data.', employees: [{ id: 'demo-1', name: 'Jane Doe', department: 'Engineering' }] },
  crm: { _demoMode: true, module: 'Zoho CRM', message: 'Demo data — connect ZOHO_* env vars for live data.', leads: [{ id: 'demo-1', name: 'Acme Corp', stage: 'Negotiation' }] },
  desk: { _demoMode: true, module: 'Zoho Desk', message: 'Demo data — connect ZOHO_* env vars for live data.', tickets: [{ id: 'demo-1', subject: 'Cannot log in', status: 'Open' }] },
  books: { _demoMode: true, module: 'Zoho Books', message: 'Demo data — connect ZOHO_* env vars for live data.', invoices: [{ id: 'demo-1', customer: 'Acme Corp', amount: 4200, status: 'Paid' }] },
};

/**
 * Calls a Zoho One API endpoint on behalf of the portal, using the backend
 * service-account token. `appKey` is one of people/crm/desk/books and is
 * used purely to pick demo data / base path — actual authorization
 * happens before this function is ever called (see middleware/zohoAuthorize).
 */
async function callZohoApi(appKey, path, { method = 'GET', params = {}, data = undefined } = {}) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    // DEMO MODE: no real Zoho credentials configured.
    return DEMO_DATA[appKey] || { _demoMode: true, message: 'No demo data configured for this module.' };
  }

  try {
    const response = await axios({
      method,
      url: `${env.zoho.apiBaseUrl}${path}`,
      params,
      data,
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    });
    return response.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Zoho API call failed [${appKey} ${path}]:`, err.response?.data || err.message);
    throw new AppError('Zoho API request failed', err.response?.status === 401 ? 502 : 502);
  }
}

module.exports = { getAccessToken, callZohoApi, isDemoMode: () => !env.zoho.isConfigured };
