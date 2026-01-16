const express = require('express');

/**
 * Main Express application
 * Configures middleware and routes for the REST API
 */

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DevOps CI/CD Pipeline API',
    version: '1.0.0'
  });
});

// Import routes
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/users');

// Register routes
app.use(healthRoutes);
app.use(userRoutes);

/**
 * Start the Express server
 * @param {number} port - Port number (default: 3000)
 * @returns {Promise<Server>} HTTP server instance
 */
function startServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Server running on port ${port}`);
        resolve(server);
      }
    });
  });
}

module.exports = { app, startServer };
