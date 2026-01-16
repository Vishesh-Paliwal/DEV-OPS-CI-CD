const fc = require('fast-check');
const request = require('supertest');
const { app } = require('../../src/app');
const { userStore } = require('../../src/controllers/usersController');

/**
 * Property-based tests for JSON response format
 * Feature: devops-cicd-pipeline, Property 3: JSON Response Format
 * Validates: Requirements 1.6
 */
describe('Property-Based Tests: JSON Response Format', () => {
  beforeEach(() => {
    userStore.clear();
  });

  test('Property 3: JSON Response Format - all endpoints return valid JSON', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress()
        }),
        async (userData) => {
          // Test health endpoint
          const healthResponse = await request(app).get('/health');
          expect(healthResponse.headers['content-type']).toMatch(/json/);
          expect(() => JSON.parse(JSON.stringify(healthResponse.body))).not.toThrow();

          // Test GET /api/users
          const listResponse = await request(app).get('/api/users');
          expect(listResponse.headers['content-type']).toMatch(/json/);
          expect(() => JSON.parse(JSON.stringify(listResponse.body))).not.toThrow();

          // Test POST /api/users
          const createResponse = await request(app)
            .post('/api/users')
            .send(userData);
          expect(createResponse.headers['content-type']).toMatch(/json/);
          expect(() => JSON.parse(JSON.stringify(createResponse.body))).not.toThrow();

          if (createResponse.status === 201) {
            const userId = createResponse.body.data.id;

            // Test GET /api/users/:id
            const getResponse = await request(app).get(`/api/users/${userId}`);
            expect(getResponse.headers['content-type']).toMatch(/json/);
            expect(() => JSON.parse(JSON.stringify(getResponse.body))).not.toThrow();
          }

          // Clean up
          userStore.clear();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
