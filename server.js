/**
 * Server entry point
 * Starts the Express application
 */

const { startServer } = require('./src/app');

// Get port from environment variable or use default
const PORT = process.env.PORT || 3000;

// Start the server
startServer(PORT)
  .then(() => {
    console.log(`✅ Server successfully started on port ${PORT}`);
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
