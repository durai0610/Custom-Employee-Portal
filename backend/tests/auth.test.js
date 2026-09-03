require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const env = require('../src/config/env');

const PASSWORD = 'Passw0rd!123';

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials and returns an access token', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('admin@example.com');
    expect(res.body.user.roles).toContain('Admin');
  });

  it('rejects an invalid password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects a non-existent email with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: PASSWORD });
    expect(res.status).toBe(401);
  });

  it('rejects a malformed request body with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('Protected routes without/with bad tokens', () => {
  it('rejects a request with no Authorization header (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid/garbage JWT (401)', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects an expired JWT (401)', async () => {
    const { User } = require('../src/models');
    const user = await User.findOne({ where: { email: 'admin@example.com' } });
    const expiredToken = jwt.sign({ sub: user.id }, env.jwt.accessSecret, { expiresIn: -10 });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it('accepts a valid token and returns the current user', async () => {
    const login = await request(app).post('/api/auth/login').send({ email: 'hr@example.com', password: PASSWORD });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('hr@example.com');
  });
});
