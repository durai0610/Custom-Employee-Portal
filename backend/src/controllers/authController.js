const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { User, Role, Permission } = require('../models');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../services/tokenService');
const { logAudit } = require('../services/auditService');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, mirrors JWT_REFRESH_EXPIRES_IN default
  };
}

function serializeUser(user) {
  const roles = user.roles.map((r) => r.name);
  const permissions = Array.from(new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name))));
  return { ...user.toSafeJSON(), roles, permissions };
}

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] }],
  });

  // Constant-shape response whether the user exists or not, to avoid
  // leaking which emails are registered.
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordMatches || !user.isActive) {
    await logAudit(req, {
      action: 'LOGIN_FAILED',
      resource: 'auth',
      details: { email },
      userId: user?.id,
    });
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());

  await logAudit(req, { action: 'LOGIN_SUCCESS', resource: 'auth', userId: user.id });

  return res.status(200).json({
    accessToken,
    user: serializeUser(user),
  });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Missing refresh token' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const user = await User.findByPk(payload.sub, {
    include: [{ model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] }],
  });

  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'User no longer active' });
  }

  const accessToken = signAccessToken(user);
  return res.status(200).json({ accessToken, user: serializeUser(user) });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  await logAudit(req, { action: 'LOGOUT', resource: 'auth' });
  return res.status(200).json({ message: 'Logged out' });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [{ model: Role, as: 'roles', include: [{ model: Permission, as: 'permissions' }] }],
  });
  return res.status(200).json({ user: serializeUser(user) });
});

module.exports = { login, refresh, logout, me };
