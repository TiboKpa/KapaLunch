# Étape 1 : Build de l'app React
FROM node:20-alpine as build-stage
WORKDIR /app

# Augmenter la mémoire pour le build
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package*.json ./
# Utilisation de npm install car package-lock.json est manquant
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx pour la production
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
