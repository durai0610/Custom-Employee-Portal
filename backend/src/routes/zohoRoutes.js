const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { requireZohoApp } = require('../middleware/zohoAuthorize');
const { peopleProxy, crmProxy, deskProxy, booksProxy } = require('../controllers/zohoController');

const router = express.Router();

// Every route: 1) authenticate  2) verify role authorizes this Zoho app
// 3) proxy to Zoho using backend service-account credentials.
router.get('/people', authenticateToken, requireZohoApp('people'), peopleProxy);
router.get('/people/*', authenticateToken, requireZohoApp('people'), peopleProxy);
router.get('/crm', authenticateToken, requireZohoApp('crm'), crmProxy);
router.get('/crm/*', authenticateToken, requireZohoApp('crm'), crmProxy);
router.get('/desk', authenticateToken, requireZohoApp('desk'), deskProxy);
router.get('/desk/*', authenticateToken, requireZohoApp('desk'), deskProxy);
router.get('/books', authenticateToken, requireZohoApp('books'), booksProxy);
router.get('/books/*', authenticateToken, requireZohoApp('books'), booksProxy);

module.exports = router;
