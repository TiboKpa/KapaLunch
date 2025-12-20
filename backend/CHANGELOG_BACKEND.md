# Changelog Backend - KapaLunch

## [2025-12-20] - Nouvelles Fonctionnalités

### ✨ Ajouts

#### 1. Avis Initial lors de la Création de Restaurant
- Les utilisateurs peuvent maintenant ajouter un avis (note + commentaire) directement lors de la création d'un restaurant
- Le champ `initialReview` est optionnel dans la requête POST `/api/restaurants`
- Format: `{ rating: number, comment?: string }`

#### 2. Suppression de Restaurant par le Créateur
- Les utilisateurs peuvent désormais supprimer les restaurants qu'ils ont créés
- Les admins conservent la possibilité de tout supprimer
- Suppression automatique des avis associés (CASCADE)
- Route: DELETE `/api/restaurants/:id` (protection: créateur OU admin)

#### 3. Édition et Suppression d'Avis
- **Édition**: PUT `/api/reviews/:id`
  - Modification de la note et/ou du commentaire
  - Permission: auteur OU admin
  
- **Suppression**: DELETE `/api/reviews/:id`
  - Permission: auteur OU admin

#### 4. Moyenne des Notes par Restaurant
- La route GET `/api/restaurants` retourne maintenant:
  - `averageRating`: Moyenne des notes (0 si aucun avis)
  - `reviewCount`: Nombre total d'avis
- Calcul automatique avec GROUP BY et AVG()

### 🔄 Modifications

#### Routes Restaurants (`/api/restaurants`)

**POST** - Création
- **Avant**: Seulement admin
- **Maintenant**: User OU admin (pas lurker)
- **Nouveau**: Support du champ `initialReview`
- **Nouveau**: Associe automatiquement `createdBy` = userId

```json
{
  "name": "Restaurant Name",
  "address": "Full Address",
  "lat": 45.75,
  "lon": 4.85,
  "type": "Français",
  "description": "Description optionnelle",
  "initialReview": {
    "rating": 4,
    "comment": "Très bon!"
  }
}
```

**DELETE** - Suppression
- **Avant**: Seulement admin
- **Maintenant**: Créateur OU admin
- **Nouveau**: Supprime automatiquement les avis associés
- **Vérification**: `restaurant.createdBy === req.user.id OR req.user.role === 'admin'`

**GET** - Liste
- **Nouveau**: Retourne `averageRating` et `reviewCount`
- **Performance**: Optimisé avec GROUP BY

#### Routes Reviews (`/api/reviews`)

**POST** - Création
- **Modifié**: maxLength commentaire 1000 → 500 caractères
- **Ajout**: Champ `authorId` dans la réponse pour compatibilité frontend

**PUT** - Édition (NOUVEAU)
- Permission: auteur OU admin
- Peut modifier `rating` et/ou `comment`
- Validation: note 1-5, commentaire max 500 caractères

**DELETE** - Suppression (NOUVEAU)
- Permission: auteur OU admin
- Vérification: `review.userId === req.user.id OR req.user.role === 'admin'`

**GET** `/restaurant/:id`
- **Ajout**: Champ `authorId` dans chaque avis pour compatibilité frontend

### 📦 Modèles

#### Restaurant.js
- Champ `createdBy` déjà présent et fonctionnel
- Relation: `belongsTo User` via `createdBy`
- Relation: `hasMany Review` via `restaurantId`

#### Review.js
- **Modifié**: Validation commentaire max 1000 → 500 caractères
- Relations maintenues: User (author) et Restaurant

### 🛠️ Migration

**Fichier**: `backend/migrations/001_add_createdBy_to_restaurants.sql`

Si le champ `createdBy` n'existe pas encore dans votre base :

```sql
-- Exécuter la migration
mysql -u root -p kapalunch < backend/migrations/001_add_createdBy_to_restaurants.sql

-- OU avec psql pour PostgreSQL
psql -U postgres -d kapalunch -f backend/migrations/001_add_createdBy_to_restaurants.sql
```

La migration:
1. Ajoute la colonne `createdBy` si elle n'existe pas
2. Crée la contrainte de clé étrangère
3. Crée un index pour les performances
4. Attribue les restaurants existants au premier admin

### ⚠️ Breaking Changes

1. **Route POST `/api/restaurants`**
   - Accessible maintenant aux users (pas seulement admin)
   - Si cela pose problème, ajouter `requireAdmin` middleware

2. **Commentaires limités à 500 caractères**
   - Les commentaires existants > 500 caractères seront tronqués lors de l'édition

3. **Suppression de restaurant**
   - Les créateurs peuvent maintenant supprimer leurs restaurants
   - Supprime en cascade tous les avis associés

### ✅ Checklist de Test

#### Restaurants
- [ ] Un user peut créer un restaurant avec un avis initial
- [ ] Un user peut créer un restaurant sans avis initial
- [ ] Un lurker ne peut PAS créer de restaurant
- [ ] Le créateur peut supprimer son restaurant
- [ ] Un user ne peut PAS supprimer le restaurant d'un autre
- [ ] Un admin peut supprimer n'importe quel restaurant
- [ ] La suppression d'un restaurant supprime ses avis
- [ ] La liste des restaurants affiche `averageRating` et `reviewCount`

#### Avis
- [ ] Un user peut éditer son propre avis
- [ ] Un admin peut éditer n'importe quel avis
- [ ] Un user ne peut PAS éditer l'avis d'un autre
- [ ] Un user peut supprimer son propre avis
- [ ] Un admin peut supprimer n'importe quel avis
- [ ] Un user ne peut PAS supprimer l'avis d'un autre
- [ ] Les commentaires > 500 caractères sont rejetés
- [ ] Le champ `authorId` est présent dans les réponses

### 📊 Performance

- **Optimisation**: Calcul de moyenne avec SQL GROUP BY (pas en JavaScript)
- **Index**: Ajout d'index sur `createdBy` pour les requêtes JOIN
- **Eager Loading**: Inclusion des relations User et Review en une seule requête

### 🔒 Sécurité

- Toutes les routes sensibles utilisent le middleware `protect`
- Vérifications de permissions sur chaque opération
- Validation des données d'entrée avec `express-validator`
- Protection contre les injections SQL (Sequelize ORM)

### 📝 Notes

- Les relations Sequelize sont déjà correctement configurées
- Pas besoin de modifications supplémentaires dans `server.js`
- Compatible avec l'implémentation frontend existante

### 🔗 Liens Utiles

- [Documentation Sequelize - Associations](https://sequelize.org/docs/v6/core-concepts/assocs/)
- [Express Validator](https://express-validator.github.io/docs/)
- [Frontend Changes](../BACKEND_UPDATES.md)