const express = require('express');
const { getMyApps } = require('../controllers/appsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getMyApps);

module.exports = router;
