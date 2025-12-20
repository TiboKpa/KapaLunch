# KapaLunch Backend

API REST pour KapaLunch avec Node.js, Express, SQLite et système de rôles.

## 🚀 Installation

```bash
cp .env.example .env
npm install
npm run dev
```

**✅ Compte admin créé automatiquement :**
```
Email    : admin@kapalunch.local
Password : Admin123!
```

## 🎯 Stack technique

- **Node.js** + **Express**
- **Sequelize** ORM
- **SQLite** (fichier `database.sqlite` auto-créé)
- **JWT** pour authentification
- **bcryptjs** pour hashage
- **Nominatim** pour géocodage

## 🎭 Système de rôles

1. **⏳ Lurker** - Compte créé, en attente de validation admin
2. **✅ User** - Peut ajouter restaurants et avis
3. **🔑 Admin** - Gestion complète + validation utilisateurs

## 📚 API Endpoints

### Authentification `/api/auth`
- `POST /signup` - Inscription (devient lurker)
- `POST /login` - Connexion
- `GET /verify` - Vérifier token

### Restaurants `/api/restaurants`
- `GET /restaurants` - Liste des restaurants
- `GET /restaurants/:id` - Détails
- `POST /restaurants` - Créer (user/admin)
- `DELETE /restaurants/:id` - Supprimer (admin)

### Avis `/api/reviews`
- `GET /reviews/restaurant/:id` - Avis d'un restaurant
- `POST /reviews` - Ajouter un avis (user/admin)
- `PUT /reviews/:id` - Modifier son avis
- `DELETE /reviews/:id` - Supprimer son avis

### Utilisateurs `/api/users`
- `PUT /users/change-password` - Changer mot de passe
- `GET /users/lurkers` - Liste lurkers (admin)
- `PUT /users/:id/validate` - Valider lurker (admin)
- `DELETE /users/:id` - Supprimer utilisateur (admin)

### Géocodage `/api/geocode`
- `POST /geocode` - Convertir adresse en lat/lon
- `POST /geocode/reverse` - Convertir lat/lon en adresse

## 💾 Base de données SQLite

### Tables principales

**users**
- id, name, email, password (hashé), role, isActive

**restaurants**
- id, name, address, lat, lon, type, description, createdBy

**reviews**
- id, rating (1-5), comment, userId, restaurantId

### Gestion
- **Fichier** : `database.sqlite` (racine backend)
- **Auto-création** au démarrage
- **Réinitialiser** : Supprimer le fichier et redémarrer

## 🔧 Configuration

Fichier `.env` :
```env
PORT=5000
NODE_ENV=development
DB_PATH=./database.sqlite
JWT_SECRET=votre_secret_jwt_super_securise
NOMINATIM_USER_AGENT=KapaLunch
CORS_ORIGIN=http://localhost:3000
```

## 🛡️ Sécurité

- ✅ Mots de passe hashés (bcrypt)
- ✅ JWT avec expiration 7 jours
- ✅ Validation des entrées
- ✅ Middleware auth sur routes protégées
- ⚠️ **Changez JWT_SECRET en production**
- ⚠️ **Changez le mot de passe admin**

## 👨‍💻 Développement

### Tests avec curl

**Inscription**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

**Connexion**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kapalunch.local","password":"Admin123!"}'
```

**Lister restaurants**
```bash
curl http://localhost:5000/api/restaurants
```

## 🐛 Dépannage

**Port déjà utilisé**
```bash
# Éditer .env
PORT=5001
```

**Réinitialiser la base**
```bash
rm database.sqlite
npm run dev
```

## 📝 Licence

MIT