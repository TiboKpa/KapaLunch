# Stage 1: Build Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend

# Install libc6-compat for vite/esbuild on Alpine
# Essential for 'vite build' to work on Alpine Linux
RUN apk add --no-cache libc6-compat git

# Increase memory limit for Node to prevent OOM
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install deps
COPY frontend/package*.json ./
# Use 'npm install' because package-lock.json is missing in the repo
RUN npm install --legacy-peer-deps

# Copy all source files
COPY frontend/ .

# Ensure proper casing for critical files (Linux is case-sensitive)
# This fixes the common issue where "App.jsx" is imported but file is "app.jsx" or similar
# We use a wildcard copy to be sure, but file names in repo seem correct.
# The real issue might be how Vite resolves paths in Docker.

# DEBUG: List all files recursively to help identify missing files in logs
RUN find src -maxdepth 3

# Build with verbose logging to see exactly why it fails
RUN npm run build -- --debug

# Stage 2: Build Backend & Serve
FROM node:20-alpine
WORKDIR /app

# Setup Backend
COPY backend/package*.json ./
# Use 'npm install' because package-lock.json is missing in the repo
RUN npm install --production --legacy-peer-deps

# Copy backend source code
COPY backend/ .

# Copy built frontend assets to a 'public' folder in backend
COPY --from=frontend-builder /app/frontend/dist ./public

# Environment variables
ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
