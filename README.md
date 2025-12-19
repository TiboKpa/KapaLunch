# 🍽️ KapaLunch

Application complète de gestion de restaurants avec carte interactive.

## 📚 Architecture

```
KapaLunch/
├── frontend/    # React + Vite + Leaflet
└── backend/     # Node.js + Express + MongoDB
```

## 🚀 Installation complète

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos valeurs (MongoDB URI, JWT_SECRET)
npm run dev
```

L'API sera disponible sur `http://localhost:5000/api`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🛠️ Configuration

### MongoDB

**Option 1 : MongoDB local**
```bash
# Installer MongoDB
brew install mongodb-community  # macOS
sudo apt install mongodb        # Ubuntu

# Démarrer MongoDB
mongod
```

**Option 2 : MongoDB Atlas (cloud gratuit)**
1. Créer un compte sur [mongodb.com](https://mongodb.com)
2. Créer un cluster gratuit
3. Récupérer l'URI de connexion
4. Mettre à jour `MONGODB_URI` dans `backend/.env`

### Premier utilisateur admin

```bash
# Se connecter à MongoDB
mongosh kapalunch

# Rendre un utilisateur admin
db.users.updateOne(
  { email: "votre@email.com" },
  { $set: { isAdmin: true } }
)
```

## ✨ Fonctionnalités

- ✅ **Carte interactive** avec markers restaurants (Leaflet)
- ✅ **Authentification** JWT (signup/login)
- ✅ **Gestion des rôles** (utilisateur normal vs admin)
- ✅ **Ajout de restaurants** depuis le site (admin uniquement)
- ✅ **Recherche et filtres** en temps réel
- ✅ **Géocodage automatique** des adresses (Nominatim)
- ✅ **Responsive design** mobile-friendly

## 📚 API Endpoints

### Authentification
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify` - Vérifier le token

### Restaurants
- `GET /api/restaurants` - Liste des restaurants
- `GET /api/restaurants/:id` - Détails d'un restaurant
- `POST /api/restaurants` - Créer un restaurant (admin)
- `PUT /api/restaurants/:id` - Modifier un restaurant (admin)
- `DELETE /api/restaurants/:id` - Supprimer un restaurant (admin)

### Géocodage
- `POST /api/geocode` - Géocoder une adresse
- `POST /api/geocode/reverse` - Géocodage inversé

## 💻 Technologies

### Frontend
- React 18
- Vite
- Leaflet / React-Leaflet
- Axios

### Backend
- Node.js
- Express
- MongoDB / Mongoose
- JWT
- bcryptjs

## 👨‍💻 Développement

Créé avec ❤️ par TiboKpa