# Backend Updates Required

Ce fichier documente les modifications à apporter au backend pour supporter les nouvelles fonctionnalités.

## 1. Routes Reviews (édition et suppression)

Dans `backend/routes/reviews.js`, ajouter :

```javascript
// PUT /api/reviews/:id - Modifier un avis
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const userId = req.user.id

    // Récupérer l'avis
    const review = await Review.findByPk(id)
    
    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' })
    }

    // Vérifier les permissions (propriétaire ou admin)
    if (review.authorId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    // Mettre à jour
    review.rating = rating
    review.comment = comment
    await review.save()

    res.json({ 
      success: true, 
      message: 'Avis modifié avec succès',
      data: review 
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})

// DELETE /api/reviews/:id - Supprimer un avis
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const review = await Review.findByPk(id)
    
    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' })
    }

    // Vérifier les permissions (propriétaire ou admin)
    if (review.authorId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    await review.destroy()

    res.json({ 
      success: true, 
      message: 'Avis supprimé avec succès' 
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})
```

## 2. Routes Restaurants (suppression)

Dans `backend/routes/restaurants.js`, ajouter :

```javascript
// DELETE /api/restaurants/:id - Supprimer un restaurant
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const restaurant = await Restaurant.findByPk(id)
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant non trouvé' })
    }

    // Vérifier les permissions (créateur ou admin)
    if (restaurant.createdBy !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    // Supprimer tous les avis associés
    await Review.destroy({ where: { restaurantId: id } })

    // Supprimer le restaurant
    await restaurant.destroy()

    res.json({ 
      success: true, 
      message: 'Restaurant supprimé avec succès' 
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})
```

## 3. Modèle Restaurant (ajout du champ createdBy)

Dans `backend/models/Restaurant.js`, modifier pour ajouter :

```javascript
const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  lon: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {  // NOUVEAU CHAMP
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'restaurants',
  timestamps: true
})
```

## 4. Migration Base de Données

Créer une migration pour ajouter le champ `createdBy` :

```sql
ALTER TABLE restaurants ADD COLUMN createdBy INTEGER NOT NULL DEFAULT 1;
ALTER TABLE restaurants ADD FOREIGN KEY (createdBy) REFERENCES users(id);
```

Ou avec Sequelize CLI :

```bash
npx sequelize-cli migration:generate --name add-createdBy-to-restaurants
```

Puis dans le fichier de migration :

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('restaurants', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('restaurants', 'createdBy')
  }
}
```

## 5. Création de Restaurant avec Avis Initial

Dans `backend/routes/restaurants.js`, modifier la route POST :

```javascript
// POST /api/restaurants - Créer un restaurant
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, address, lat, lon, type, description, initialReview } = req.body
    const userId = req.user.id

    // Créer le restaurant
    const restaurant = await Restaurant.create({
      name,
      address,
      lat,
      lon,
      type,
      description,
      createdBy: userId  // Associer au créateur
    })

    // Si un avis initial est fourni, le créer
    if (initialReview && initialReview.rating) {
      await Review.create({
        restaurantId: restaurant.id,
        authorId: userId,
        rating: initialReview.rating,
        comment: initialReview.comment || ''
      })
    }

    res.status(201).json({ 
      success: true, 
      message: 'Restaurant créé avec succès',
      data: restaurant 
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})
```

## 6. Calculer la Moyenne des Notes

Pour afficher la moyenne dans la liste des restaurants, modifier la route GET :

```javascript
// GET /api/restaurants - Liste avec moyenne des notes
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [{
        model: Review,
        attributes: []
      }],
      attributes: {
        include: [
          [
            sequelize.fn('AVG', sequelize.col('Reviews.rating')),
            'averageRating'
          ]
        ]
      },
      group: ['Restaurant.id']
    })

    res.json({ 
      success: true,
      data: restaurants 
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message })
  }
})
```

## 7. Vérifications de Sécurité

- ✅ Authentification obligatoire pour toutes les opérations de modification
- ✅ Vérification que l'utilisateur est propriétaire OU admin
- ✅ Validation des données d'entrée
- ✅ Gestion des erreurs appropriée
- ✅ Suppression en cascade des avis lors de la suppression d'un restaurant

## 8. Tests à Effectuer

1. **Édition d'avis**
   - Un utilisateur peut modifier son propre avis
   - Un admin peut modifier n'importe quel avis
   - Un utilisateur ne peut pas modifier l'avis d'un autre

2. **Suppression d'avis**
   - Un utilisateur peut supprimer son propre avis
   - Un admin peut supprimer n'importe quel avis
   - Un utilisateur ne peut pas supprimer l'avis d'un autre

3. **Suppression de restaurant**
   - Le créateur peut supprimer son restaurant
   - Un admin peut supprimer n'importe quel restaurant
   - Les avis sont bien supprimés en cascade

4. **Création avec avis initial**
   - Le restaurant est créé avec l'avis
   - L'avis est bien associé au restaurant et à l'utilisateur

## Notes Importantes

- Le champ `createdBy` doit être ajouté à la base de données
- Les restaurants existants auront besoin d'une valeur par défaut pour `createdBy`
- Assurez-vous que les modèles Review et Restaurant sont bien importés dans les routes
- Le middleware `authMiddleware` doit extraire `req.user.id` et `req.user.role`