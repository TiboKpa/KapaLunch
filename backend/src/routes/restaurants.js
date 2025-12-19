import express from 'express'
import { body, validationResult } from 'express-validator'
import Restaurant from '../models/Restaurant.js'
import { protect } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query

    let filter = { isValidated: true }

    if (type && type !== 'all') {
      filter.type = type
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ]
    }

    const restaurants = await Restaurant.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants
    })

  } catch (error) {
    console.error('Erreur get restaurants:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des restaurants'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('createdBy', 'name email')

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

router.post('/', [
  protect,
  requireAdmin,
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('address').trim().notEmpty().withMessage('L\'adresse est requise'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
  body('lon').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { name, address, lat, lon, type, description } = req.body

    const existingRestaurant = await Restaurant.findOne({ 
      name, 
      address 
    })

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'Un restaurant avec ce nom et cette adresse existe déjà'
      })
    }

    const restaurant = await Restaurant.create({
      name,
      address,
      lat,
      lon,
      type: type || '',
      description: description || '',
      createdBy: req.user._id
    })

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

router.put('/:id', [
  protect,
  requireAdmin
], async (req, res) => {
  try {
    const { name, address, lat, lon, type, description } = req.body

    const restaurant = await Restaurant.findById(req.params.id)

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

router.delete('/:id', [
  protect,
  requireAdmin
], async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé'
      })
    }

    await restaurant.deleteOne()

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

router.get('/meta/types', async (req, res) => {
  try {
    const types = await Restaurant.distinct('type')
    
    res.json({
      success: true,
      data: types.filter(type => type !== '')
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