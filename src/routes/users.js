const express = require('express');
const usersController = require('../controllers/usersController');

const router = express.Router();

/**
 * User routes
 * Handles user management endpoints
 */

// GET /api/users - Get all users
router.get('/api/users', usersController.getAll);

// GET /api/users/:id - Get user by ID
router.get('/api/users/:id', usersController.getById);

// POST /api/users - Create new user
router.post('/api/users', usersController.create);

module.exports = router;
