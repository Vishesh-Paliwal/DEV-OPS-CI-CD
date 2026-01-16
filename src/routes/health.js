const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

/**
 * Health check route
 * GET /health - Returns application health status
 */
router.get('/health', healthController.check);

module.exports = router;
