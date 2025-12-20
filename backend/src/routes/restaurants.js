import express from 'express'
import { body, validationResult } from 'express-validator'
import { Op } from 'sequelize'
import { sequelize } from '../config/database.js'
import Restaurant from '../models/Restaurant.js'
import Review from '../models/Review.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = express.Router()

// GET tous les restaurants avec moyenne des notes
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query

    let where = { isValidated: true }

    if (type && type !== 'all') {
      where.type = type
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ]
    }

    const restaurants = await Restaurant.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: []
        }
      ],
      attributes: {
        include: [
          [
            sequelize.fn('AVG', sequelize.col('reviews.rating')),
            'averageRating'
          ],
          [
            sequelize.fn('COUNT', sequelize.col('reviews.id')),
            'reviewCount'
          ]
        ]
      },
      group: ['Restaurant.id', 'creator.id'],
      order: [['createdAt', 'DESC']],
      subQuery: false
    })

    // Convertir averageRating en nombre pour chaque restaurant
    const restaurantsWithRatings = restaurants.map(restaurant => {
      const data = restaurant.toJSON()
      data.averageRating = data.averageRating ? parseFloat(data.averageRating) : 0
      data.reviewCount = data.reviewCount ? parseInt(data.reviewCount) : 0
      return data
    })

    res.json({
      success: true,
      count: restaurantsWithRatings.length,
      data: restaurantsWithRatings
    })

  } catch (error) {
    console.error('Erreur get restaurants:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des restaurants'
    })
  }
})

// GET un restaurant par ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }]
    })

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé'
      })
    }

    res.json({
      success: true,
      data: restaurant
    })

  } catch (error) {
    console.error('Erreur get restaurant:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du restaurant'
    })
  }
})

// POST créer un restaurant (user ou admin) avec avis initial optionnel
router.post('/', [
  protect,
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('address').trim().notEmpty().withMessage('L\'adresse est requise'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
  body('lon').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide')
], async (req, res) => {
  try {
    // Vérifier que l'utilisateur peut créer (user ou admin, pas lurker)
    if (req.user.role === 'lurker') {
      return res.status(403).json({
        success: false,
        message: 'Votre compte doit être validé pour ajouter un restaurant'
      })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { name, address, lat, lon, type, description, initialReview } = req.body

    // Vérifier si le restaurant existe déjà
    const existingRestaurant = await Restaurant.findOne({ 
      where: { name, address }
    })

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'Un restaurant avec ce nom et cette adresse existe déjà'
      })
    }

    // Créer le restaurant
    const restaurant = await Restaurant.create({
      name,
      address,
      lat,
      lon,
      type: type || '',
      description: description || '',
      createdBy: req.user.id
    })

    // Si un avis initial est fourni, le créer
    if (initialReview && initialReview.rating) {
      await Review.create({
        userId: req.user.id,
        restaurantId: restaurant.id,
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
    console.error('Erreur create restaurant:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du restaurant'
    })
  }
})

// PUT mettre à jour un restaurant (admin seulement)
router.put('/:id', [
  protect,
  requireAdmin
], async (req, res) => {
  try {
    const { name, address, lat, lon, type, description } = req.body

    const restaurant = await Restaurant.findByPk(req.params.id)

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé'
      })
    }

    if (name) restaurant.name = name
    if (address) restaurant.address = address
    if (lat) restaurant.lat = lat
    if (lon) restaurant.lon = lon
    if (type !== undefined) restaurant.type = type
    if (description !== undefined) restaurant.description = description

    await restaurant.save()

    res.json({
      success: true,
      message: 'Restaurant mis à jour avec succès',
      data: restaurant
    })

  } catch (error) {
    console.error('Erreur update restaurant:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du restaurant'
    })
  }
})

// DELETE supprimer un restaurant (créateur ou admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id)

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé'
      })
    }

    // Vérifier que c'est le créateur ou un admin
    if (restaurant.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres restaurants'
      })
    }

    // Supprimer tous les avis associés
    await Review.destroy({ 
      where: { restaurantId: req.params.id } 
    })

    // Supprimer le restaurant
    await restaurant.destroy()

    res.json({
      success: true,
      message: 'Restaurant supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur delete restaurant:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du restaurant'
    })
  }
})

// GET types de cuisine disponibles
router.get('/meta/types', async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      attributes: ['type'],
      group: ['type'],
      where: {
        type: { [Op.ne]: '' }
      }
    })
    
    const types = restaurants.map(r => r.type)
    
    res.json({
      success: true,
      data: types
    })

  } catch (error) {
    console.error('Erreur get types:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des types'
    })
  }
})

export default router