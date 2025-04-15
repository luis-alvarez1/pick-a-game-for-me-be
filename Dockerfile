# Build stage
FROM node:22.14-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json yarn.lock ./

# Install dependencies and clean cache in one layer
RUN npm install -g yarn --force && \
    yarn install --frozen-lockfile && \
    yarn cache clean

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:22.14-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json yarn.lock ./

# Install production dependencies and clean cache in one layer
RUN npm install -g yarn --force && \
    yarn install --production --frozen-lockfile && \
    yarn cache clean && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Remove unnecessary files
RUN rm -rf /app/node_modules/.cache && \
    find /app/node_modules -type d -name "test" -o -name "tests" -o -name "docs" -o -name "examples" | xargs rm -rf

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"] 