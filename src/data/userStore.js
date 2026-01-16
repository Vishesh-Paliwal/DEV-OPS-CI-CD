const { randomUUID } = require('crypto');

/**
 * In-memory user storage using Map data structure
 * Provides CRUD operations for user management
 */
class UserStore {
  constructor() {
    this.users = new Map();
  }

  /**
   * Get all users
   * @returns {Array<Object>} Array of all users
   */
  getAllUsers() {
    return Array.from(this.users.values());
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Object|null} User object or null if not found
   */
  getUserById(id) {
    return this.users.get(id) || null;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data (name, email)
   * @returns {Object} Created user with id and createdAt
   */
  createUser(userData) {
    const user = {
      id: randomUUID(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date().toISOString()
    };
    
    this.users.set(user.id, user);
    return user;
  }

  /**
   * Check if user exists by ID
   * @param {string} id - User ID
   * @returns {boolean} True if user exists
   */
  userExists(id) {
    return this.users.has(id);
  }

  /**
   * Check if email already exists
   * @param {string} email - Email address
   * @returns {boolean} True if email exists
   */
  emailExists(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clear all users (useful for testing)
   */
  clear() {
    this.users.clear();
  }
}

module.exports = UserStore;
