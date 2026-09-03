require('./setup');
const request = require('supertest');
const app = require('../src/app');

const PASSWORD = 'Passw0rd!123';

async function loginAs(email) {
  const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  return res.body.accessToken;
}

describe('GET /api/apps — role-based Zoho app visibility', () => {
  it('HR sees only Zoho People', async () => {
    const token = await loginAs('hr@example.com');
    const res = await request(app).get('/api/apps').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.apps.map((a) => a.key)).toEqual(['people']);
  });

  it('Sales sees only Zoho CRM', async () => {
    const token = await loginAs('sales@example.com');
    const res = await request(app).get('/api/apps').set('Authorization', `Bearer ${token}`);
    expect(res.body.apps.map((a) => a.key)).toEqual(['crm']);
  });

  it('Support sees only Zoho Desk', async () => {
    const token = await loginAs('support@example.com');
    const res = await request(app).get('/api/apps').set('Authorization', `Bearer ${token}`);
    expect(res.body.apps.map((a) => a.key)).toEqual(['desk']);
  });

  it('Finance sees only Zoho Books', async () => {
    const token = await loginAs('finance@example.com');
    const res = await request(app).get('/api/apps').set('Authorization', `Bearer ${token}`);
    expect(res.body.apps.map((a) => a.key)).toEqual(['books']);
  });

  it('Admin sees all four Zoho apps', async () => {
    const token = await loginAs('admin@example.com');
    const res = await request(app).get('/api/apps').set('Authorization', `Bearer ${token}`);
    expect(res.body.apps.map((a) => a.key).sort()).toEqual(['books', 'crm', 'desk', 'people']);
  });
});

describe('Zoho proxy — backend enforces authorization regardless of frontend', () => {
  it('Sales calling the Finance (Books) endpoint gets 403', async () => {
    const token = await loginAs('sales@example.com');
    const res = await request(app).get('/api/zoho/books').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('HR calling the CRM endpoint gets 403', async () => {
    const token = await loginAs('hr@example.com');
    const res = await request(app).get('/api/zoho/crm').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('HR calling their own People endpoint succeeds', async () => {
    const token = await loginAs('hr@example.com');
    const res = await request(app).get('/api/zoho/people').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('Admin can call every Zoho endpoint', async () => {
    const token = await loginAs('admin@example.com');
    for (const path of ['people', 'crm', 'desk', 'books']) {
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app).get(`/api/zoho/${path}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    }
  });
});

describe('Admin API authorization', () => {
  it('a normal (non-admin) user gets 403 from GET /api/admin/users', async () => {
    const token = await loginAs('hr@example.com');
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('Admin can access GET /api/admin/users', async () => {
    const token = await loginAs('admin@example.com');
    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('a normal user cannot create a user (403), and no user is created', async () => {
    const token = await loginAs('finance@example.com');
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Intruder', email: 'intruder@example.com', password: 'Passw0rd!123' });
    expect(res.status).toBe(403);
  });
});
