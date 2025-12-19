import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { protect, generateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', [
  body('name').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { name, email, password } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      })
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: false
    })

    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })

  } catch (error) {
    console.error('Erreur signup:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte'
    })
  }
})

router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ce compte a été désactivé'
      })
    }

    const token = generateToken(user.id)

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    })

  } catch (error) {
    console.error('Erreur login:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    })
  }
})

router.get('/verify', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  })
})

router.get('/profile', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  })
})

export default router