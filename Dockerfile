# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with platform fix
RUN npm install --platform=linux --arch=x64

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
