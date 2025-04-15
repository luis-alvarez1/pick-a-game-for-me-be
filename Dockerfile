# Build stage
FROM node:22.14-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22.14-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy games.json
COPY games.json ./

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"] 