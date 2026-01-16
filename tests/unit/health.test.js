const request = require('supertest');
const { app } = require('../../src/app');

/**
 * Unit tests for health check endpoint
 * Validates: Requirements 1.1, 1.6
 */
describe('Health Check Endpoint', () => {
  test('should return 200 status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  test('should return valid JSON', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toBeDefined();
  });

  test('should return health status object', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('should return valid timestamp', async () => {
    const response = await request(app).get('/health');
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  test('should return numeric uptime', async () => {
    const response = await request(app).get('/health');
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });
});
