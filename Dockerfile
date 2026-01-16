# Use Node.js 18 Alpine as base image for minimal size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/
COPY server.js ./

# Expose port 3000
EXPOSE 3000

# Run as non-root user for security
USER node

# Start the application
CMD ["node", "server.js"]
