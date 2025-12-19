import express from 'express'
import { body, validationResult } from 'express-validator'
import { geocodeAddress, reverseGeocode } from '../utils/geocoder.js'

const router = express.Router()

router.post('/', [
  body('address').trim().notEmpty().withMessage('L\'adresse est requise')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { address } = req.body

    const result = await geocodeAddress(address)

    if (result.success) {
      res.json({
        success: true,
        lat: result.lat,
        lon: result.lon,
        displayName: result.displayName
      })
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      })
    }

  } catch (error) {
    console.error('Erreur geocode:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du géocodage'
    })
  }
})

router.post('/reverse', [
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

    const { lat, lon } = req.body

    const result = await reverseGeocode(lat, lon)

    if (result.success) {
      res.json({
        success: true,
        address: result.address
      })
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      })
    }

  } catch (error) {
    console.error('Erreur reverse geocode:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du géocodage inversé'
    })
  }
})

export default router