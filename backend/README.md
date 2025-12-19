# KapaLunch Backend

API Node.js/Express + **SQLite** pour KapaLunch.

## 🚀 Installation

```bash
cp .env.example .env
npm install
npm run dev
```

**C'est tout !** SQLite crée automatiquement le fichier `database.sqlite` au démarrage.

## 📚 API Endpoints

### Authentification (`/api/auth`)
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/verify` - Vérifier le token

### Restaurants (`/api/restaurants`)
- `GET /api/restaurants` - Liste restaurants
- `GET /api/restaurants/:id` - Détails d'un restaurant
- `POST /api/restaurants` - Créer restaurant (admin)
- `PUT /api/restaurants/:id` - Modifier restaurant (admin)
- `DELETE /api/restaurants/:id` - Supprimer restaurant (admin)

### Géocodage (`/api/geocode`)
- `POST /api/geocode` - Géocoder une adresse
- `POST /api/geocode/reverse` - Géocodage inversé

## 🔑 Créer un utilisateur admin

### Méthode 1 : SQLite CLI
```bash
sqlite3 database.sqlite
UPDATE users SET isAdmin = 1 WHERE email = 'votre@email.com';
.quit
```

### Méthode 2 : Script SQL
```bash
echo "UPDATE users SET isAdmin = 1 WHERE email = 'votre@email.com';" | sqlite3 database.sqlite
```

## 💾 Base de données SQLite

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