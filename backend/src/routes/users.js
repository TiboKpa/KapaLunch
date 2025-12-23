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

// Lister TOUS les utilisateurs (lurkers + users + admins) - admin uniquement
router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      })
    }

    const users = await User.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['role', 'ASC'], ['name', 'ASC']]
    })

    res.json({
      success: true,
      count: users.length,
      data: users
    })

  } catch (error) {
    console.error('Erreur get users:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
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

// Changer le rôle d'un utilisateur (admin uniquement)
// Supporte lurker -> user, user -> admin, admin -> user
router.put('/:id/role', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      })
    }

    const { newRole, emailConfirmation } = req.body

    if (!['lurker', 'user', 'admin'].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      })
    }

    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      })
    }

    // Protection contre la modification du compte admin par défaut
    if (user.email === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de modifier le compte admin par défaut'
      })
    }

    // Protection contre l'auto-rétrogradation
    if (user.id === req.user.id && newRole !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas rétrograder votre propre compte'
      })
    }

    // Vérification par email pour promotion admin
    if (newRole === 'admin' && user.role !== 'admin') {
      if (!emailConfirmation) {
        return res.status(400).json({
          success: false,
          message: 'Confirmation par email requise pour promouvoir un administrateur'
        })
      }

      if (emailConfirmation.toLowerCase() !== user.email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'L\'email de confirmation ne correspond pas'
        })
      }
    }

    const oldRole = user.role
    user.role = newRole
    await user.save()

    let message = ''
    if (oldRole === 'lurker' && newRole === 'user') {
      message = `${user.name} a été validé en tant qu'utilisateur`
    } else if (newRole === 'admin') {
      message = `${user.name} est maintenant administrateur`
    } else if (oldRole === 'admin' && newRole === 'user') {
      message = `${user.name} a été rétrogradé en utilisateur standard`
    } else {
      message = `Rôle de ${user.name} modifié : ${oldRole} → ${newRole}`
    }

    res.json({
      success: true,
      message,
      data: user
    })

  } catch (error) {
    console.error('Erreur changement rôle:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de rôle'
    })
  }
})

// Valider un lurker en user (admin uniquement) - LEGACY, utiliser /role maintenant
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

// Rejeter/supprimer un utilisateur (admin uniquement)
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

    // Empêcher l'auto-suppression
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
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

export default router