const fc = require('fast-check');
const request = require('supertest');
const { app } = require('../../src/app');
const { userStore } = require('../../src/controllers/usersController');

/**
 * Property-based tests for validation
 * Feature: devops-cicd-pipeline, Property 4: Invalid User Data Rejection
 * Validates: Requirements 1.7
 */
describe('Property-Based Tests: Validation', () => {
  beforeEach(() => {
    userStore.clear();
  });

  test('Property 4: Invalid User Data Rejection - invalid data returns 400', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Missing name
          fc.record({
            email: fc.emailAddress()
          }),
          // Missing email
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 })
          }),
          // Empty name
          fc.record({
            name: fc.constant('   '),
            email: fc.emailAddress()
          }),
          // Invalid email
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }),
            email: fc.string().filter(s => !s.includes('@') || !s.includes('.'))
          }),
          // Name too long
          fc.record({
            name: fc.string({ minLength: 101, maxLength: 200 }),
            email: fc.emailAddress()
          })
        ),
        async (invalidData) => {
          const response = await request(app)
            .post('/api/users')
            .send(invalidData);

          // Should return 400 Bad Request
          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);

          // Verify no user was created
          const listResponse = await request(app).get('/api/users');
          const userCount = listResponse.body.data.length;

          // User count should remain 0
          expect(userCount).toBe(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('Property 5: Email Uniqueness Enforcement - duplicate emails return 409', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name1: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          name2: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress()
        }),
        async ({ name1, name2, email }) => {
          // Create first user
          const response1 = await request(app)
            .post('/api/users')
            .send({ name: name1, email });

          expect(response1.status).toBe(201);

          // Try to create second user with same email
          const response2 = await request(app)
            .post('/api/users')
            .send({ name: name2, email });

          // Should return 409 Conflict
          expect(response2.status).toBe(409);
          expect(response2.body.success).toBe(false);
          expect(response2.body.error).toBe('Email already exists');

          // Verify only one user exists
          const listResponse = await request(app).get('/api/users');
          expect(listResponse.body.data.length).toBe(1);

          // Clean up
          userStore.clear();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
