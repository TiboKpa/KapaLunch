# 🍽️ KapaLunch

Application complète de gestion de restaurants avec carte interactive.

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

**SQLite crée automatiquement le fichier `database.sqlite` au démarrage !**

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🔑 Premier utilisateur admin

```bash
cd backend
sqlite3 database.sqlite
UPDATE users SET isAdmin = 1 WHERE email = "votre@email.com";
.quit
```

Ou en une ligne :
```bash
echo "UPDATE users SET isAdmin = 1 WHERE email = 'votre@email.com';" | sqlite3 backend/database.sqlite
```

## ✨ Fonctionnalités

- ✅ **Carte interactive** avec markers restaurants (Leaflet)
- ✅ **Authentification** JWT (signup/login)
- ✅ **Gestion des rôles** (utilisateur normal vs admin)
- ✅ **Ajout de restaurants** depuis le site (admin uniquement)
- ✅ **Recherche et filtres** en temps réel
- ✅ **Géocodage automatique** des adresses (Nominatim)
- ✅ **Responsive design** mobile-friendly
- ✅ **SQLite** - Zéro configuration de base de données

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
- **SQLite** / Sequelize
- JWT
- bcryptjs

## 💾 SQLite - Avantages

- ✅ **Zéro installation** - Pas de serveur à installer
- ✅ **Fichier unique** - Toute la DB dans `database.sqlite`
- ✅ **Auto-création** - Démarre immédiatement
- ✅ **Portable** - Copiez le fichier pour sauvegarder
- ✅ **Parfait pour le développement** et les petits projets

## 👨‍💻 Développement

Créé avec ❤️ par TiboKpa