# KapaLunch Backend

API Node.js/Express + MongoDB pour KapaLunch.

## Installation

```bash
cp .env.example .env
npm install
npm run dev
```

## API Endpoints

- `POST /api/auth/signup` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/restaurants` - Liste restaurants
- `POST /api/restaurants` - Créer restaurant (admin)
- `POST /api/geocode` - Géocoder une adresse