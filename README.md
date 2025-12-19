# 🍽️ KapaLunch

Application complète de gestion de restaurants avec carte interactive, système de rôles et avis utilisateurs.

## 📚 Architecture

```
KapaLunch/
├── frontend/    # React + Vite + Leaflet
└── backend/     # Node.js + Express + SQLite
```

## 🚀 Installation complète

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Pas de configuration nécessaire !
npm run dev
```

L'API sera disponible sur `http://localhost:5000/api`

**✅ SQLite crée automatiquement le fichier `database.sqlite` au démarrage !**

**✅ Un compte admin par défaut est créé : `admin` / `admin`**

**⚠️ IMPORTANT : Changez le mot de passe admin après la première connexion !**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🎭 Système de rôles

### 4 niveaux d'accès :

**1. 🌍 Visiteur (non connecté)**
- Voir la carte interactive
- Consulter tous les restaurants
- Lire les avis

**2. ⏳ Lurker (compte créé, en attente)**
- Créé automatiquement à l'inscription
- Doit être validé par un administrateur
- Accès en lecture seule

**3. ✅ User (validé par admin)**
- Peut ajouter des restaurants
- Peut laisser des avis et notes (1-5 ⭐)
- Peut modifier/supprimer ses propres avis

**4. 🔑 Admin**
- Tous les droits d'un User +
- Valider/rejeter les lurkers
- Promouvoir des users en admin
- Modifier/supprimer n'importe quel restaurant ou avis
- Accès au panneau d'administration

## 🔑 Compte admin par défaut

**Identifiants :**
```
Email : admin
Mot de passe : admin
```

**Après la première connexion :**
1. Cliquer sur "🔐 Mot de passe" dans le header
2. Changer le mot de passe

## ✨ Fonctionnalités

### Générales
- ✅ **Carte interactive** avec markers restaurants (Leaflet)
- ✅ **Recherche et filtres** en temps réel
- ✅ **Géocodage automatique** des adresses (Nominatim)
- ✅ **Responsive design** mobile-friendly
- ✅ **SQLite** - Zéro configuration

### Authentification
- ✅ **Inscription/Connexion** avec JWT
- ✅ **Système de rôles** (lurker/user/admin)
- ✅ **Changement de mot de passe** sécurisé
- ✅ **Validation des comptes** par admin

### Avis et notes
- ✅ **Notation 1-5 étoiles** par restaurant
- ✅ **Commentaires** jusqu'à 1000 caractères
- ✅ **Note moyenne** calculée automatiquement
- ✅ **Nom de l'auteur** visible sur chaque avis
- ✅ **Affichage dans les popups** de carte
- ✅ **Modal détaillée** avec tous les avis

### Administration
- ✅ **Panneau admin** dédié
- ✅ **Liste des lurkers** en attente
- ✅ **Validation en un clic**
- ✅ **Gestion des utilisateurs**

## 📚 API Endpoints

### Authentification (`/api/auth`)
- `POST /signup` - Inscription (devient lurker)
- `POST /login` - Connexion
- `GET /verify` - Vérifier le token

### Restaurants (`/api/restaurants`)
- `GET /restaurants` - Liste des restaurants
- `GET /restaurants/:id` - Détails d'un restaurant
- `POST /restaurants` - Créer (user/admin)
- `PUT /restaurants/:id` - Modifier (admin)
- `DELETE /restaurants/:id` - Supprimer (admin)

### Avis (`/api/reviews`)
- `GET /reviews/restaurant/:id` - Avis d'un restaurant
- `POST /reviews` - Ajouter un avis (user/admin)
- `PUT /reviews/:id` - Modifier son avis
- `DELETE /reviews/:id` - Supprimer son avis

### Utilisateurs (`/api/users`)
- `PUT /users/change-password` - Changer son mot de passe
- `GET /users/lurkers` - Liste des lurkers (admin)
- `PUT /users/:id/validate` - Valider un lurker (admin)
- `PUT /users/:id/promote` - Promouvoir en admin (admin)
- `DELETE /users/:id` - Supprimer un utilisateur (admin)

### Géocodage (`/api/geocode`)
- `POST /geocode` - Géocoder une adresse
- `POST /geocode/reverse` - Géocodage inversé

## 💻 Technologies

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool rapide
- **Leaflet / React-Leaflet** - Carte interactive
- **Axios** - Requêtes HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM pour SQLite
- **SQLite** - Base de données fichier
- **JWT** - Authentification par token
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données

## 💾 SQLite - Avantages

- ✅ **Zéro installation** - Pas de serveur à installer
- ✅ **Fichier unique** - Toute la DB dans `database.sqlite`
- ✅ **Auto-création** - Démarre immédiatement
- ✅ **Portable** - Copiez le fichier pour sauvegarder
- ✅ **Parfait pour le développement** et les petits projets

## 🛠️ Workflow complet

### 1. Premier démarrage
```bash
# Backend
cd backend && npm install && npm run dev
# ✅ Admin créé : admin / admin

# Frontend (nouveau terminal)
cd frontend && npm install && npm run dev
```

### 2. Se connecter en tant qu'admin
- Aller sur http://localhost:3000
- Cliquer "Se connecter"
- Email : `admin`, Mot de passe : `admin`
- **Changer le mot de passe immédiatement !**

### 3. Ajouter un restaurant
- Cliquer "➕ Ajouter un restaurant"
- Remplir le formulaire
- Le restaurant apparaît sur la carte

### 4. Valider un nouvel utilisateur
- Un utilisateur s'inscrit (devient lurker)
- Admin clique "🛠️ Panneau Admin"
- Voir la liste des lurkers
- Cliquer "✓ Valider" (devient user)

### 5. Laisser un avis
- Cliquer sur un restaurant dans la liste
- Modal avec détails s'ouvre
- Sélectionner les étoiles (1-5)
- Écrire un commentaire (optionnel)
- Publier l'avis

## 👨‍💻 Structure des données

### Table `users`
```javascript
{
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  password: "hashed",
  role: "user",        // lurker | user | admin
  isActive: true,
  createdAt: "2025-12-20",
  updatedAt: "2025-12-20"
}
```

### Table `restaurants`
```javascript
{
  id: 1,
  name: "Le Bon Resto",
  address: "123 Rue de Paris",
  lat: 48.8566,
  lon: 2.3522,
  type: "Français",
  description: "Cuisine traditionnelle",
  createdBy: 1,         // userId
  isValidated: true,
  createdAt: "2025-12-20"
}
```

### Table `reviews`
```javascript
{
  id: 1,
  rating: 4,            // 1-5
  comment: "Très bon !",
  userId: 2,
  restaurantId: 1,
  createdAt: "2025-12-20"
}
```

## 🔧 Dépannage

### Backend ne démarre pas
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend ne démarre pas
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Réinitialiser la base de données
```bash
cd backend
rm database.sqlite
npm run dev  # L'admin sera recréé automatiquement
```

### Problèmes CORS
Vérifier que dans `backend/.env` :
```
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Déploiement

### Options recommandées
- **Frontend** : Vercel / Netlify (gratuit)
- **Backend** : Render.com (gratuit, 750h/mois)
- **Database** : SQLite inclus dans Render

Voir la documentation de déploiement pour plus de détails.

## 👨‍💻 Développement

Créé avec ❤️ par TiboKpa

## 📝 Licence

MIT