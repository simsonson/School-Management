const request = require('supertest');
const app = require('../src/app');

describe('API starter tests', () => {
  test('GET / returns health message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('School Management API is running');
  });

  test('POST /api/auth/login validates required fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Missing required field');
  });

  test('GET /api/admin/mock/attendance requires auth token', async () => {
    const res = await request(app).get('/api/admin/mock/attendance');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
