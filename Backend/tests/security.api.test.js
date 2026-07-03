const request = require('supertest');

const API_ORIGIN = (process.env.TEST_API_ORIGIN || 'https://ai-solutions-dj7s.onrender.com')
  .replace(/\/+$/, '');

const api = request(API_ORIGIN);
const longRequest = { response: 60000, deadline: 90000 };

describe('Security input handling and protected API access', () => {
  test('backend health endpoint is reachable', async () => {
    const response = await api
      .get('/health')
      .timeout(longRequest)
      .expect(200);

    expect(response.body.status).toBe('ok');
  });

  test('sanitises XSS payload submitted through public inquiry form', async () => {
    const response = await api
      .post('/api/inquiries')
      .send({
        name: "<script>alert('XSS')</script>",
        email: `jest-xss-${Date.now()}@example.com`,
        phone: '9800000000',
        companyName: 'Jest Security Test',
        country: 'Nepal',
        jobTitle: 'Security Tester',
        jobDetails: "<img src=x onerror=alert('XSS')>",
      })
      .timeout(longRequest)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).not.toContain('<script>');
    expect(response.body.data.jobDetails).not.toContain('<img');
    expect(response.body.data.name).toContain('&lt;script');
    expect(response.body.data.jobDetails).toContain('&lt;img');
  });

  test('rejects NoSQL-style object payload in inquiry fields', async () => {
    const response = await api
      .post('/api/inquiries')
      .send({
        name: { $ne: null },
        email: 'jest-nosql@example.com',
        phone: '9800000000',
        companyName: 'Jest Security Test',
        country: 'Nepal',
        jobTitle: 'Security Tester',
        jobDetails: 'Testing NoSQL injection payload',
      })
      .timeout(longRequest)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/name/i);
  });

  test('blocks protected inquiry API without JWT token', async () => {
    const response = await api
      .get('/api/inquiries')
      .timeout(longRequest)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/token/i);
  });

  test('blocks protected dashboard API with fake JWT token', async () => {
    const response = await api
      .get('/api/dashboard/stats')
      .set('Authorization', 'Bearer fake-token')
      .timeout(longRequest)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid token/i);
  });
});
