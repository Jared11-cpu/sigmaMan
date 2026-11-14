FROM node:24-slim

WORKDIR /app

# Copy server dependency configuration
COPY server/package*.json ./server/

# Install production dependencies
WORKDIR /app/server
RUN npm ci --only=production

WORKDIR /app

# Copy application source code and root static files
COPY . .

# Environment defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DB_PATH=./data/running.sqlite \
    UPLOAD_DIR=./uploads \
    STATIC_DIR=../ \
    DEFAULT_ROOM_CODE=default \
    NODE_PATH=/app/server/node_modules

# Ensure data and uploads volumes exist
RUN mkdir -p /app/server/data /app/server/uploads

VOLUME ["/app/server/data", "/app/server/uploads"]

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "server/src/server.js"]
