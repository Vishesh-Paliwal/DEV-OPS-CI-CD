const UserStore = require('../data/userStore');
const { validateUserData } = require('../utils/validation');

// Create a singleton instance of UserStore
const userStore = new UserStore();

/**
 * Users controller
 * Handles user management operations
 */

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function getAll(req, res) {
  try {
    const users = userStore.getAllUsers();
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: [error.message]
    });
  }
}

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function getById(req, res) {
  try {
    const { id } = req.params;
    const user = userStore.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: [error.message]
    });
  }
}

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function create(req, res) {
  try {
    const userData = req.body;

    // Validate user data
    const validation = validateUserData(userData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Check for duplicate email
    if (userStore.emailExists(userData.email)) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Create user
    const newUser = userStore.createUser(userData);

    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: [error.message]
    });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  userStore // Export for testing purposes
};
