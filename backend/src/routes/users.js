import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Changer son propre mot de passe
router.put('/change-password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { currentPassword, newPassword } = req.body

    const user = await User.findByPk(req.user.id)

    // Vérifier le mot de passe actuel
    const isPasswordCorrect = await user.comparePassword(currentPassword)
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      })
    }

    // Mettre à jour le mot de passe
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    })

  } catch (error) {
    console.error('Erreur changement mot de passe:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe'
    })
  }
})

// Lister tous les lurkers (admin uniquement)
router.get('/lurkers', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      })
    }

    const lurkers = await User.findAll({
      where: { role: 'lurker', isActive: true },
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'ASC']]
    })

    res.json({
      success: true,
      count: lurkers.length,
      data: lurkers
    })

  } catch (error) {
    console.error('Erreur get lurkers:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des lurkers'
    })
  }
})

// Valider un lurker en user (admin uniquement)
router.put('/:id/validate', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      })
    }

    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    if (user.role !== 'lurker') {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur n\'est pas un lurker'
      })
    }

    user.role = 'user'
    await user.save()

    res.json({
      success: true,
      message: `${user.name} est maintenant un utilisateur validé`,
      data: user
    })

  } catch (error) {
    console.error('Erreur validation lurker:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation de l\'utilisateur'
    })
  }
})

// Rejeter/supprimer un lurker (admin uniquement)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      })
    }

    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    // Empêcher la suppression de l'admin par défaut
    if (user.email === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer l\'admin par défaut'
      })
    }

    await user.destroy()

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression utilisateur:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    })
  }
})

// Promouvoir un user en admin (admin uniquement)
router.put('/:id/promote', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      })
    }

    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur est déjà administrateur'
      })
    }

    user.role = 'admin'
    await user.save()

    res.json({
      success: true,
      message: `${user.name} est maintenant administrateur`,
      data: user
    })

  } catch (error) {
    console.error('Erreur promotion admin:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la promotion de l\'utilisateur'
    })
  }
})

export default router