# KapaLunch Frontend

Interface utilisateur React + Vite avec carte interactive Leaflet, système de rôles et avis.

## 🚀 Installation

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🎨 Composants

### Composants principaux

**App.jsx**
- Composant racine de l'application
- Gestion de l'état global (user, restaurants, modales)
- Orchestration des composants

**Header.jsx**
- Barre de navigation en haut
- Badge de rôle utilisateur (🔑 Admin / ✅ User / ⏳ Lurker)
- Boutons selon le rôle :
  - ➕ Ajouter un restaurant (user/admin)
  - 🛠️ Panneau Admin (admin uniquement)
  - 🔐 Mot de passe (tous)
  - Déconnexion

**Map.jsx**
- Carte interactive Leaflet
- Markers rouges pour chaque restaurant
- Popups enrichies avec :
  - Nom et adresse du restaurant
  - Note moyenne avec étoiles
  - Top 3 derniers avis
  - Noms des auteurs
- Cache des avis pour performance

**RestaurantList.jsx**
- Liste déroulante des restaurants
- Barre de recherche (nom/adresse)
- Filtre par type de cuisine
- Clic sur restaurant = zoom carte

### Composants d'ajout

**AddRestaurantForm.jsx**
- Formulaire d'ajout de restaurant
- Champs : nom, adresse, type, description
- Géocodage automatique de l'adresse
- Réservé aux users et admins

**AddReviewForm.jsx**
- Formulaire d'ajout d'avis
- Sélecteur d'étoiles interactif (1-5)
- Zone de commentaire (max 1000 caractères)
- Compteur de caractères
- Bloqué pour les lurkers avec message

### Composants d'affichage

**RestaurantDetail.jsx**
- Modal complète détails restaurant
- Header avec gradient coloré
- Note moyenne calculée
- Formulaire d'ajout d'avis intégré
- Liste complète des avis avec scroll
- Clic extérieur pour fermer

**ReviewList.jsx**
- Liste des avis d'un restaurant
- Affichage : auteur + étoiles + commentaire + date
- Format : "👤 Jean Dupont - ⭐⭐⭐⭐⭐"
- Message si aucun avis

### Composants de gestion

**LoginModal.jsx**
- Modal de connexion/inscription
- Basculement entre les deux modes
- Validation des champs
- Messages d'erreur

**ChangePasswordModal.jsx**
- Changement de mot de passe sécurisé
- 3 champs : actuel, nouveau, confirmation
- Vérification correspondance
- Messages de succès/erreur

**AdminPanel.jsx**
- Panneau d'administration (admin uniquement)
- Liste des lurkers en attente
- Informations : nom, email, date d'inscription
- Actions : ✓ Valider ou ✗ Rejeter
- Mise à jour automatique après action

## 🎨 Styles

### Fichiers CSS

**src/styles/App.css**
- Styles de base de l'application
- Layout responsive
- Header, sidebar, carte
- Formulaires et boutons de base
- Modales de base

**src/styles/features.css**
- Styles spécifiques aux nouvelles fonctionnalités
- Badges de rôles
- Panneau admin
- Cards d'avis (reviews)
- Formulaire d'ajout d'avis
- Modal RestaurantDetail
- Popups enrichies
- Responsive mobile

### Thème couleurs

```css
/* Gradient principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Rôles */
--admin-color: #d4af37;    /* Or */
--user-color: #4caf50;     /* Vert */
--lurker-color: #ff9800;   /* Orange */

/* Étoiles */
--star-color: #ffc107;     /* Jaune */

/* Boutons */
--primary: #667eea;        /* Violet */
--success: #4caf50;        /* Vert */
--danger: #f44336;         /* Rouge */
```

## 📋 Structure du projet

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AddRestaurantForm.jsx
│   │   ├── AddReviewForm.jsx       ✅ Nouveau
│   │   ├── AdminPanel.jsx           ✅ Nouveau
│   │   ├── ChangePasswordModal.jsx  ✅ Nouveau
│   │   ├── Header.jsx               🔄 Mis à jour
│   │   ├── LoginModal.jsx
│   │   ├── Map.jsx                  🔄 Mis à jour
│   │   ├── RestaurantDetail.jsx     ✅ Nouveau
│   │   ├── RestaurantList.jsx
│   │   └── ReviewList.jsx           ✅ Nouveau
│   ├── styles/
│   │   ├── App.css
│   │   └── features.css             ✅ Nouveau
│   ├── App.jsx                      🔄 Mis à jour
│   └── main.jsx
├── package.json
├── vite.config.js
└── .env.example
```

## 🔌 Communication avec l'API

### Configuration

Toutes les requêtes API pointent vers `http://localhost:5000/api`

### Authentification

Le token JWT est stocké dans `localStorage` :
```javascript
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(userData))
```

Envoyé dans les headers :
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Endpoints utilisés

```javascript
// Auth
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/verify

// Restaurants
GET /api/restaurants
POST /api/restaurants

// Reviews
GET /api/reviews/restaurant/:id
POST /api/reviews
DELETE /api/reviews/:id

// Users
PUT /api/users/change-password
GET /api/users/lurkers
PUT /api/users/:id/validate
DELETE /api/users/:id

// Geocoding
POST /api/geocode
```

## 🛠️ Configuration Vite

**vite.config.js**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

Le proxy permet d'éviter les problèmes CORS en développement.

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Carte et sidebar en colonne */
  /* Header vertical */
  /* Cards pleine largeur */
}
```

### Adaptations mobile

- Carte et sidebar empilés verticalement
- Header sur 2 lignes
- Boutons pleine largeur
- Modales adaptées
- Formulaires optimisés tactile

## ✨ Fonctionnalités frontend

### Visiteur (non connecté)
- ✅ Voir la carte interactive
- ✅ Consulter les restaurants
- ✅ Lire les avis dans les popups
- ✅ Voir les détails (sans formulaire d'avis)

### Lurker (compte créé)
- ✅ Badge orange "⏳ En attente"
- ✅ Message : "Votre compte doit être validé"
- ✅ Bouton "Changer mot de passe" visible
- ❌ Pas de bouton "Ajouter restaurant"
- ❌ Formulaire d'avis bloqué

### User (validé)
- ✅ Badge vert "✅ Utilisateur"
- ✅ Bouton "➕ Ajouter un restaurant"
- ✅ Peut laisser des avis
- ✅ Peut modifier/supprimer ses avis

### Admin
- ✅ Badge or "🔑 Admin"
- ✅ Bouton "🛠️ Panneau Admin"
- ✅ Voir et valider les lurkers
- ✅ Tous les droits User +
- ✅ Peut tout modifier/supprimer

## 🔧 Développement

### Lancer en mode développement
```bash
npm run dev
```

### Build pour production
```bash
npm run build
```
Génère le dossier `dist/` avec les fichiers optimisés.

### Preview du build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## 📚 Dépendances principales

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "axios": "^1.6.0"
}
```

## 🔍 Débogage

### Console du navigateur

Ouvrir les DevTools (F12) pour voir :
- Erreurs JavaScript
- Requêtes réseau (onglet Network)
- State React (avec React DevTools)

### Erreurs fréquentes

**"Network Error"**
- Vérifier que le backend tourne sur le port 5000
- Vérifier la config CORS dans le backend

**"Token invalid"**
- Supprimer le localStorage et se reconnecter
```javascript
localStorage.clear()
```

**Carte ne s'affiche pas**
- Vérifier que Leaflet CSS est importé
- Vérifier la connexion internet (tiles OpenStreetMap)

## 🚀 Déploiement

### Vercel (recommandé)

1. Connecter le repo GitHub
2. Framework preset : Vite
3. Root Directory : `frontend`
4. Build Command : `npm run build`
5. Output Directory : `dist`
6. Variables d'environnement :
   ```
   VITE_API_URL=https://votre-backend.onrender.com/api
   ```

### Netlify

Similaire à Vercel, avec un fichier `netlify.toml` :
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 👨‍💻 Contribution

### Ajouter un nouveau composant

1. Créer le fichier dans `src/components/`
2. Utiliser les hooks React (useState, useEffect)
3. Suivre la convention de nommage PascalCase
4. Ajouter les styles dans `features.css`
5. Importer et utiliser dans `App.jsx`

### Guidelines

- Utiliser des composants fonctionnels avec hooks
- PropTypes pour la validation (optionnel)
- Commentaires pour logique complexe
- Noms de variables explicites
- Gestion d'erreur pour les appels API

## 📝 Licence

MIT