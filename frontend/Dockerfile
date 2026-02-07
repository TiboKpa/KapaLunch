# Étape 1 : Build de l'app React
FROM node:20-alpine as build-stage
WORKDIR /app

# Fix critique pour esbuild/Vite sur Alpine
RUN apk add --no-cache libc6-compat

# Augmenter la mémoire pour le build
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx pour la production
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
