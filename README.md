# KapaLunch 🍽️

Application web interactive de découverte et de notation de restaurants. Elle propose une carte dynamique, un système d'avis communautaire et une gestion des utilisateurs complète.

![Statut](https://img.shields.io/badge/Statut-Opérationnel-success) ![Docker](https://img.shields.io/badge/Docker-Ready-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Fonctionnalités

- **Carte Interactive** : Visualisation de tous les restaurants avec clustering (Leaflet).
- **Recherche Avancée** : Filtrage par type de cuisine, ville et note moyenne.
- **Ajout Simplifié** : Géocodage automatique des adresses et détection du type de cuisine.
- **Avis & Notes** : Système de notation de 1 à 5 étoiles avec commentaires.
- **Rôles Utilisateurs** :
  - *Visiteur* : Consultation seule.
  - *Lurker* : Compte créé, en attente de validation.
  - *Utilisateur* : Peut ajouter des restaurants et des avis.
  - *Admin* : Gestion complète des utilisateurs (validation, suppression) et du contenu.

## 🚀 Installation Rapide (Docker)

L'application est conçue pour être déployée comme un **conteneur unique** (Monolithique) : le backend Node.js sert également l'interface React compilée. C'est la méthode recommandée pour la production.

### Pré-requis
- Docker & Docker Compose
- (Optionnel) Portainer pour une gestion graphique

### Déploiement

```bash
# Cloner le dépôt
git clone https://github.com/TiboKpa/KapaLunch.git
cd KapaLunch

# Lancer l'application
docker compose up -d --build
```

L'application sera accessible sur `http://localhost:5000` (ou le port défini).

### Configuration (Variables d'environnement)

Vous pouvez configurer l'application via un fichier `.env` ou directement dans votre gestionnaire de conteneurs :

| Variable | Défaut | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port interne du serveur Node.js |
| `JWT_SECRET` | *(insecure)* | **Critique** : Clé secrète pour signer les sessions. |
| `NODE_ENV` | `production` | Environnement d'exécution |

**Pour Portainer :** Mappez le port conteneur `5000` vers un port hôte de votre choix (ex: `8080`).

## 🛠️ Développement Local

Pour contribuer ou modifier le code, vous pouvez lancer les deux parties séparément.

### 1. Backend (API)

```bash
cd backend
npm install
# Créez un fichier .env basé sur .env.example
npm run dev
```
L'API tourne sur `http://localhost:5000`.
**Compte Admin par défaut** : `admin@kapalunch.local` / `Admin123!`

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
L'interface tourne sur `http://localhost:3000` (ou 5173).

## 🏗️ Architecture Technique

- **Conteneurisation** : Build multi-stage optimisé (Node 20 Alpine).
- **Frontend** : React 18, Vite, Leaflet (Cartographie), CSS Modules.
- **Backend** : Node.js, Express, Base de données fichier (JSON/SQLite) pour la simplicité.
- **Sécurité** : Authentification JWT, Hashage bcrypt, Protection CORS.

## 📝 Licence

Ce projet est sous licence MIT. Libre à vous de le modifier et de le distribuer.
