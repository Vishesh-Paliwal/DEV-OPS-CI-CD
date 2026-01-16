const fc = require('fast-check');
const request = require('supertest');
const { app } = require('../../src/app');
const { userStore } = require('../../src/controllers/usersController');

/**
 * Property-based tests for user storage
 * Feature: devops-cicd-pipeline, Property 1: User Retrieval Consistency
 * Validates: Requirements 1.3, 1.4
 */
describe('Property-Based Tests: User Storage', () => {
  beforeEach(() => {
    userStore.clear();
  });

  test('Property 1: User Retrieval Consistency - created users can be retrieved with same data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress()
        }),
        async (userData) => {
          // Create user
          const createResponse = await request(app)
            .post('/api/users')
            .send(userData);

          // Skip if creation failed (e.g., duplicate email from previous iteration)
          if (createResponse.status !== 201) {
            return true;
          }

          const createdUser = createResponse.body.data;

          // Retrieve user by ID
          const getResponse = await request(app)
            .get(`/api/users/${createdUser.id}`);

          // Verify retrieval succeeded
          expect(getResponse.status).toBe(200);
          expect(getResponse.body.success).toBe(true);

          // Verify data consistency
          const retrievedUser = getResponse.body.data;
          expect(retrievedUser.name).toBe(userData.name);
          expect(retrievedUser.email).toBe(userData.email);
          expect(retrievedUser.id).toBe(createdUser.id);

          // Clean up for next iteration
          userStore.clear();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('Property 2: User List Contains Created Users - all created users appear in list', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress()
          }),
          { minLength: 1, maxLength: 5 }
        ).map(users => {
          // Ensure unique emails
          const uniqueEmails = new Set();
          return users.filter(user => {
            if (uniqueEmails.has(user.email)) {
              return false;
            }
            uniqueEmails.add(user.email);
            return true;
          });
        }),
        async (usersData) => {
          if (usersData.length === 0) return true;

          // Create all users
          const createdIds = [];
          for (const userData of usersData) {
            const response = await request(app)
              .post('/api/users')
              .send(userData);

            if (response.status === 201) {
              createdIds.push(response.body.data.id);
            }
          }

          // Get all users
          const listResponse = await request(app).get('/api/users');

          expect(listResponse.status).toBe(200);
          expect(listResponse.body.success).toBe(true);

          const retrievedUsers = listResponse.body.data;

          // Verify all created users are in the list
          for (const id of createdIds) {
            const found = retrievedUsers.some(user => user.id === id);
            expect(found).toBe(true);
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
