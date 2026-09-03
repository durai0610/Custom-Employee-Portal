const express = require('express');
const { login, refresh, logout, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { loginValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);

module.exports = router;
