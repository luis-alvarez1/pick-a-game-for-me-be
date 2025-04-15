# Build stage
FROM node:22.14-alpine AS builder

WORKDIR /app

# Install yarn
RUN npm install -g yarn

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:22.14-alpine

WORKDIR /app

# Install yarn
RUN npm install -g yarn --force

# Copy package files
COPY package*.json yarn.lock ./

# Install production dependencies only
RUN yarn install --production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"] 