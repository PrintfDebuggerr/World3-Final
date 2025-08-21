# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with memory optimization
RUN npm ci --no-audit --no-fund --prefer-offline

# Copy source code
COPY . .

# Build the application with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
