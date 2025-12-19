# KapaLunch Backend

API Node.js/Express + **SQLite** + système de rôles et avis pour KapaLunch.

## 🚀 Installation

```bash
cp .env.example .env
npm install
npm run dev
```

**C'est tout !** SQLite crée automatiquement le fichier `database.sqlite` au démarrage.

**✅ Un compte admin par défaut est automatiquement créé :**
```
Email : admin
Mot de passe : admin
```

**⚠️ IMPORTANT : Changez le mot de passe après la première connexion !**

## 🎭 Système de rôles

### 3 rôles disponibles :

**1. Lurker (⏳ en attente)**
- Créé automatiquement lors de l'inscription
- Peut se connecter mais aucune action
- Doit être validé par un admin

**2. User (✅ validé)**
- Peut ajouter des restaurants
- Peut laisser des avis avec notes (1-5 étoiles)
- Peut modifier/supprimer ses propres avis

**3. Admin (🔑 administrateur)**
- Tous les droits d'un User +
- Peut valider les lurkers en users
- Peut promouvoir des users en admin
- Peut modifier/supprimer n'importe quel contenu
- Accès au panneau d'administration

## 📚 API Endpoints

### Authentification (`/api/auth`)

**POST `/api/auth/signup` - Inscription**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "motdepasse"
}
```
Réponse : Token JWT + user (role: "lurker")

**POST `/api/auth/login` - Connexion**
```json
{
  "email": "admin",
  "password": "admin"
}
```
Réponse : Token JWT + user (avec role)

**GET `/api/auth/verify` - Vérifier le token**
Headers : `Authorization: Bearer TOKEN`
Réponse : Infos utilisateur

### Restaurants (`/api/restaurants`)

**GET `/api/restaurants` - Liste restaurants**
Query params : `?type=Français&search=Paris`

**GET `/api/restaurants/:id` - Détails restaurant**
Réponse : Restaurant avec infos créateur

**POST `/api/restaurants` - Créer restaurant** (user/admin)
```json
{
  "name": "Le Bon Resto",
  "address": "123 Rue de Paris, 75001 Paris",
  "lat": 48.8566,
  "lon": 2.3522,
  "type": "Français",
  "description": "Cuisine traditionnelle"
}
```
Headers : `Authorization: Bearer TOKEN`

**PUT `/api/restaurants/:id` - Modifier restaurant** (admin)
**DELETE `/api/restaurants/:id` - Supprimer restaurant** (admin)

### Avis (`/api/reviews`)

**GET `/api/reviews/restaurant/:restaurantId` - Avis d'un restaurant**
Public, pas besoin d'auth
Réponse : Liste des avis avec auteurs

**POST `/api/reviews` - Ajouter un avis** (user/admin)
```json
{
  "restaurantId": 1,
  "rating": 4,
  "comment": "Très bon restaurant !"
}
```
Headers : `Authorization: Bearer TOKEN`
Note : Un utilisateur ne peut laisser qu'un seul avis par restaurant

**PUT `/api/reviews/:id` - Modifier son avis** (auteur ou admin)
```json
{
  "rating": 5,
  "comment": "Excellent !"
}
```

**DELETE `/api/reviews/:id` - Supprimer un avis** (auteur ou admin)

### Utilisateurs (`/api/users`)

**PUT `/api/users/change-password` - Changer son mot de passe**
```json
{
  "currentPassword": "ancien",
  "newPassword": "nouveau"
}
```
Headers : `Authorization: Bearer TOKEN`

**GET `/api/users/lurkers` - Liste des lurkers** (admin)
Headers : `Authorization: Bearer TOKEN`
Réponse : Liste des utilisateurs en attente de validation

**PUT `/api/users/:id/validate` - Valider un lurker en user** (admin)
Headers : `Authorization: Bearer TOKEN`

**PUT `/api/users/:id/promote` - Promouvoir un user en admin** (admin)
Headers : `Authorization: Bearer TOKEN`

**DELETE `/api/users/:id` - Supprimer un utilisateur** (admin)
Headers : `Authorization: Bearer TOKEN`
Note : Impossible de supprimer l'admin par défaut

### Géocodage (`/api/geocode`)

**POST `/api/geocode` - Géocoder une adresse**
```json
{
  "address": "Tour Eiffel, Paris"
}
```
Réponse : Lat, lon et nom complet

**POST `/api/geocode/reverse` - Géocodage inversé**
```json
{
  "lat": 48.8566,
  "lon": 2.3522
}
```
Réponse : Adresse formatée

## 🔑 Créer un utilisateur admin

### Méthode 1 : SQLite CLI
```bash
sqlite3 database.sqlite
UPDATE users SET role = 'admin' WHERE email = 'votre@email.com';
.quit
```

### Méthode 2 : Script SQL
```bash
echo "UPDATE users SET role = 'admin' WHERE email = 'votre@email.com';" | sqlite3 database.sqlite
```

### Méthode 3 : Via l'API (avec un admin existant)
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID/promote \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 💾 Base de données SQLite

### Structure des tables

**users**
- id (INTEGER PRIMARY KEY)
- name (STRING)
- email (STRING UNIQUE)
- password (STRING hashed)
- role (ENUM: lurker, user, admin)
- isActive (BOOLEAN)
- createdAt, updatedAt (TIMESTAMP)

**restaurants**
- id (INTEGER PRIMARY KEY)
- name (STRING)
- address (STRING)
- lat, lon (FLOAT)
- type (STRING)
- description (TEXT)
- createdBy (INTEGER FK -> users)
- isValidated (BOOLEAN)
- createdAt, updatedAt (TIMESTAMP)

**reviews**
- id (INTEGER PRIMARY KEY)
- rating (INTEGER 1-5)
- comment (TEXT)
- userId (INTEGER FK -> users)
- restaurantId (INTEGER FK -> restaurants)
- createdAt, updatedAt (TIMESTAMP)

### Fichier base de données
- **Fichier** : `database.sqlite` (créé automatiquement)
- **Localisation** : Racine du dossier backend
- **Sauvegarde** : Copier le fichier .sqlite
- **Réinitialiser** : Supprimer le fichier, redémarrer le serveur

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Sequelize** - ORM pour SQLite
- **SQLite** - Base de données fichier
- **JWT** - Authentification par token
- **bcryptjs** - Hashage des mots de passe
- **express-validator** - Validation des données
- **axios** - Géocodage Nominatim

## 🧪 Tests avec Thunder Client (VS Code)

### 1. Inscription
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@test.com",
  "password": "123456"
}
```

### 2. Connexion admin
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin",
  "password": "admin"
}
```

### 3. Lister les lurkers
```http
GET http://localhost:5000/api/users/lurkers
Authorization: Bearer VOTRE_TOKEN_ADMIN
```

### 4. Valider un lurker
```http
PUT http://localhost:5000/api/users/1/validate
Authorization: Bearer VOTRE_TOKEN_ADMIN
```

### 5. Ajouter un avis
```http
POST http://localhost:5000/api/reviews
Content-Type: application/json
Authorization: Bearer VOTRE_TOKEN_USER

{
  "restaurantId": 1,
  "rating": 5,
  "comment": "Excellent restaurant !"
}
```

## 🔧 Dépannage

### Port 5000 déjà utilisé
Éditer `.env` :
```
PORT=5001
```

### Erreur de connexion SQLite
```bash
rm database.sqlite
npm run dev  # Recrée la DB
```

### Admin non créé
Vérifier les logs au démarrage :
```
✅ Admin par défaut créé : admin / admin
```

Si absent, supprimer le fichier DB et redémarrer.

## 📝 Variables d'environnement

Fichier `.env` :
```env
PORT=5000
NODE_ENV=development
DB_PATH=./database.sqlite
JWT_SECRET=votre_secret_jwt_super_securise
NOMINATIM_USER_AGENT=KapaLunch
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Déploiement

### Render.com (recommandé)
1. Créer un Web Service
2. Connecter le repo GitHub
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Ajouter les variables d'environnement

SQLite fonctionne nativement sur Render avec un volume persistant.

## 👨‍💻 Sécurité

- ✅ Mots de passe hashés avec bcrypt (salt 10)
- ✅ JWT avec expiration 7 jours
- ✅ Validation des entrées avec express-validator
- ✅ Protection CORS configurable
- ✅ Middleware d'authentification sur routes protégées
- ✅ Vérification des rôles pour actions sensibles
- ⚠️ **CHANGEZ le JWT_SECRET en production !**
- ⚠️ **CHANGEZ le mot de passe admin par défaut !**