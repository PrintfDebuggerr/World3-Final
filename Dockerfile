# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with memory optimization
RUN npm install --no-audit --no-fund --prefer-offline --production=false

# Copy source code
COPY . .

# Build the application with memory optimization
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

# Remove dev dependencies and build tools to reduce image size
RUN npm prune --production && apk del python3 make g++

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
