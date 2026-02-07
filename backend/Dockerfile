FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
# Utilisation de npm install car package-lock.json est manquant
RUN npm install --only=production

# Copie du code source
COPY . .

# Création du dossier pour la DB
RUN mkdir -p /app/data

# Exposition du port
EXPOSE 5000

# Démarrage
CMD ["node", "src/server.js"]
