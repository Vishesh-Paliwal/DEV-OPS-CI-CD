/**
 * Health check controller
 * Provides application health status endpoint
 */

/**
 * Health check handler
 * Returns application status, timestamp, and uptime
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function check(req, res) {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };

  res.status(200).json(healthData);
}

module.exports = { check };
