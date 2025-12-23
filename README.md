# KapaLunch

Application web de découverte et notation de restaurants avec carte interactive.

## Fonctionnalités

- Carte interactive avec tous les restaurants
- Recherche et filtres avancés (type, ville, note)
- Système de rôles (visiteur, utilisateur, admin)
- Avis et notations (1-5 étoiles)
- Géolocalisation automatique via OpenStreetMap

## Installation rapide

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API disponible sur `http://localhost:5000`

**Compte admin par défaut :**
- Email : `admin@kapalunch.local`
- Mot de passe : `Admin123!`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Application disponible sur `http://localhost:5173`

## Stack technique

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