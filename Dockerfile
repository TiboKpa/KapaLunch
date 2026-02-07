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

# Build
COPY frontend/ .

# Try standard build script first
RUN npm run build

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
