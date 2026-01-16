const UserStore = require('../../src/data/userStore');

/**
 * Unit tests for UserStore
 * Validates: Requirements 1.2, 1.3, 1.4
 */
describe('UserStore', () => {
  let store;

  beforeEach(() => {
    store = new UserStore();
  });

  describe('createUser', () => {
    test('should create a user with generated ID', () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const user = store.createUser(userData);

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name', 'John Doe');
      expect(user).toHaveProperty('email', 'john@example.com');
      expect(user).toHaveProperty('createdAt');
    });

    test('should generate unique IDs for different users', () => {
      const user1 = store.createUser({ name: 'User 1', email: 'user1@example.com' });
      const user2 = store.createUser({ name: 'User 2', email: 'user2@example.com' });

      expect(user1.id).not.toBe(user2.id);
    });

    test('should set createdAt timestamp', () => {
      const user = store.createUser({ name: 'John', email: 'john@example.com' });
      const timestamp = new Date(user.createdAt);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('getAllUsers', () => {
    test('should return empty array when no users exist', () => {
      const users = store.getAllUsers();
      expect(users).toEqual([]);
    });

    test('should return all created users', () => {
      store.createUser({ name: 'User 1', email: 'user1@example.com' });
      store.createUser({ name: 'User 2', email: 'user2@example.com' });

      const users = store.getAllUsers();
      expect(users).toHaveLength(2);
    });
  });

  describe('getUserById', () => {
    test('should return user when ID exists', () => {
      const created = store.createUser({ name: 'John', email: 'john@example.com' });
      const retrieved = store.getUserById(created.id);

      expect(retrieved).toEqual(created);
    });

    test('should return null when ID does not exist', () => {
      const user = store.getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('userExists', () => {
    test('should return true when user exists', () => {
      const user = store.createUser({ name: 'John', email: 'john@example.com' });
      expect(store.userExists(user.id)).toBe(true);
    });

    test('should return false when user does not exist', () => {
      expect(store.userExists('non-existent-id')).toBe(false);
    });
  });

  describe('emailExists', () => {
    test('should return true when email exists', () => {
      store.createUser({ name: 'John', email: 'john@example.com' });
      expect(store.emailExists('john@example.com')).toBe(true);
    });

    test('should return false when email does not exist', () => {
      expect(store.emailExists('nonexistent@example.com')).toBe(false);
    });
  });

  describe('clear', () => {
    test('should remove all users', () => {
      store.createUser({ name: 'User 1', email: 'user1@example.com' });
      store.createUser({ name: 'User 2', email: 'user2@example.com' });

      store.clear();

      expect(store.getAllUsers()).toHaveLength(0);
    });
  });
});
