const request = require('supertest');
const { app } = require('../../src/app');
const { userStore } = require('../../src/controllers/usersController');

/**
 * Unit tests for user endpoints
 * Validates: Requirements 1.2, 1.3, 1.4, 1.6, 1.7
 */
describe('User Endpoints', () => {
  beforeEach(() => {
    // Clear user store before each test
    userStore.clear();
  });

  describe('GET /api/users', () => {
    test('should return empty array when no users exist', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    test('should return all users', async () => {
      // Create test users
      await request(app)
        .post('/api/users')
        .send({ name: 'User 1', email: 'user1@example.com' });
      await request(app)
        .post('/api/users')
        .send({ name: 'User 2', email: 'user2@example.com' });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return user when ID exists', async () => {
      // Create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({ name: 'John Doe', email: 'john@example.com' });

      const userId = createResponse.body.data.id;

      // Get the user
      const response = await request(app).get(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.email).toBe('john@example.com');
    });

    test('should return 404 when user does not exist', async () => {
      const response = await request(app).get('/api/users/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('POST /api/users', () => {
    test('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.email).toBe('john@example.com');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    test('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'john@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'John Doe' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'John Doe', email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should return 409 for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      // Create first user
      await request(app).post('/api/users').send(userData);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Jane Doe', email: 'john@example.com' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already exists');
    });

    test('should return JSON response', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'John Doe', email: 'john@example.com' });

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
