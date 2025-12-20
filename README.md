# 🍽️ KapaLunch

Application de découverte et notation de restaurants avec carte interactive, système de rôles et avis utilisateurs.

## ✨ Fonctionnalités principales

### 🗺️ Carte interactive
- **Vue globale** avec tous les restaurants sur une carte Leaflet
- **Markers cliquables** avec aperçu rapide
- **Centrage automatique** sur le restaurant sélectionné
- **Modes Carte/Satellite** (toggle en bas à gauche)
- **Fiches détaillées** à gauche avec avis et notes

### 🔍 Recherche et filtres
- **Recherche en temps réel** par nom ou ville
- **Filtres avancés** : type de cuisine, ville, note minimale
- **Tri** : par note (croissant/décroissant)
- **Liste latérale** avec résultats filtrés

### 👥 Système de rôles (4 niveaux)

1. **🌍 Visiteur** (non connecté)
   - Voir la carte et restaurants
   - Lire les avis

2. **⏳ Lurker** (compte créé, en attente)
   - Accès en lecture seule
   - En attente de validation admin

3. **✅ User** (validé)
   - Ajouter des restaurants
   - Laisser des avis (1-5 ⭐)
   - Modifier/supprimer ses propres avis

4. **🔑 Admin**
   - Valider/rejeter les lurkers
   - Supprimer restaurants et avis
   - Panneau d'administration

### ⭐ Avis et notations
- **Notes de 1 à 5 étoiles** par restaurant
- **Commentaires** jusqu'a 1000 caractères
- **Note moyenne** calculée automatiquement
- **Affichage du nom** de l'auteur et date
- **Édition/suppression** de ses propres avis

## 🚀 Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

API disponible sur `http://localhost:5000/api`

**✅ Compte admin par défaut créé automatiquement :**
```
Email    : admin@kapalunch.local
Password : Admin123!
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Application disponible sur `http://localhost:3000`

## 📚 Stack technique

### Frontend
- **React 18** + **Vite**
- **Leaflet** - Carte interactive
- **Axios** - Requêtes HTTP

### Backend
- **Node.js** + **Express**
- **Sequelize** + **SQLite** (base de données fichier)
- **JWT** - Authentification
- **bcryptjs** - Sécurité

## 📦 Structure

```
KapaLunch/
├── frontend/       # React + Vite + Leaflet
│   ├── src/
│   │   ├── components/  # Composants React
│   │   │   ├── Map.jsx              # Carte interactive
│   │   │   ├── RestaurantList.jsx   # Liste et filtres
│   │   │   ├── RestaurantDetail.jsx # Fiche détaillée
│   │   │   └── Header.jsx           # Header + panneau user
│   │   └── styles/      # CSS modules
│   └── package.json
│
└── backend/        # Node.js + Express + SQLite
    ├── models/      # Modèles Sequelize
    ├── routes/      # API routes
    ├── middleware/  # Auth & validation
    └── database.sqlite  # BDD (auto-créée)
```

## 🛠️ API Endpoints

### Authentification `/api/auth`
- `POST /signup` - Inscription
- `POST /login` - Connexion

### Restaurants `/api/restaurants`
- `GET /restaurants` - Liste des restaurants
- `POST /restaurants` - Créer (user/admin)
- `DELETE /restaurants/:id` - Supprimer (admin)

### Avis `/api/reviews`
- `GET /reviews/restaurant/:id` - Avis d'un restaurant
- `POST /reviews` - Ajouter un avis
- `PUT /reviews/:id` - Modifier son avis
- `DELETE /reviews/:id` - Supprimer son avis

### Utilisateurs `/api/users`
- `PUT /users/change-password` - Changer mot de passe
- `GET /users/lurkers` - Liste lurkers (admin)
- `PUT /users/:id/validate` - Valider lurker (admin)

## 👨‍💻 Créé par

TiboKpa

## 📝 Licence

MIT