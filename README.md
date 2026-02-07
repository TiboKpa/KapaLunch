# KapaLunch

Application web de découverte et notation de restaurants avec carte interactive.

## Fonctionnalités

- Carte interactive avec tous les restaurants
- Recherche et filtres avancés (type, ville, note)
- Système de rôles (visiteur, utilisateur, admin)
- Avis et notations (1-5 étoiles)
- Géolocalisation automatique via OpenStreetMap

## Installation (Docker - Recommandé)

L'application est conçue pour être déployée comme un **conteneur unique** (Monolithique) où le backend Node.js sert également les fichiers statiques du frontend.

```bash
# Lancer l'application avec Docker Compose
docker compose up -d --build
```

L'application sera accessible par défaut sur `http://localhost:5000`.

### Configuration (Portainer / Docker)

Vous pouvez personnaliser l'installation via des variables d'environnement dans votre fichier `docker-compose.yml` ou l'interface de Portainer :

| Variable | Défaut | Description |
| :--- | :--- | :--- |
| `APP_PORT` | `5000` | Port d'accès externe (ex: `8080` pour `http://localhost:8080`) |
| `JWT_SECRET` | *(insecure)* | **Critique** : Clé secrète pour signer les sessions. À changer impérativement en production. |
| `NODE_ENV` | `production` | Environnement d'exécution |

**Exemple de configuration Portainer (Environment variables) :**
- `APP_PORT` : `80`
- `JWT_SECRET` : `MaSuperCleSecreteTresLongue!!!`

## Installation (Développement local)

Pour le développement, vous pouvez lancer le frontend et le backend séparément :

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
API sur `http://localhost:5000`

**Compte admin par défaut :**
- Email : `admin@kapalunch.local`
- Mot de passe : `Admin123!`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Interface sur `http://localhost:3000` (ou 5173 selon config Vite)

## Architecture

- **Single Container** : Le build React est servi statiquement par Express en production.
- **Frontend** : React 18, Vite, Leaflet
- **Backend** : Node.js, Express, Sequelize, SQLite
- **Auth** : JWT + bcryptjs

## Rôles utilisateurs

1. **Visiteur** : Lecture seule
2. **Lurker** : Compte créé, en attente de validation
3. **User** : Peut ajouter restaurants et avis
4. **Admin** : Gestion complète + validation utilisateurs

## Licence

MIT