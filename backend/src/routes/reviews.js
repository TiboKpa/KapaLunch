import express from 'express'
import { body, validationResult } from 'express-validator'
import Review from '../models/Review.js'
import User from '../models/User.js'
import Restaurant from '../models/Restaurant.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Obtenir les avis d'un restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { restaurantId: req.params.restaurantId },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    })

    // Ajouter authorId pour compatibilité frontend
    const reviewsWithAuthorId = reviews.map(review => {
      const data = review.toJSON()
      data.authorId = data.userId
      return data
    })

    res.json({
      success: true,
      count: reviewsWithAuthorId.length,
      data: reviewsWithAuthorId
    })

  } catch (error) {
    console.error('Erreur get reviews:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis'
    })
  }
})

// Ajouter un avis (user ou admin uniquement)
router.post('/', [
  protect,
  body('restaurantId').isInt().withMessage('ID restaurant invalide'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Le commentaire ne peut pas dépasser 500 caractères')
], async (req, res) => {
  try {
    // Vérifier que l'utilisateur peut ajouter des avis (user ou admin)
    if (req.user.role === 'lurker') {
      return res.status(403).json({
        success: false,
        message: 'Votre compte doit être validé par un administrateur pour laisser un avis'
      })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const { restaurantId, rating, comment } = req.body

    // Vérifier que le restaurant existe
    const restaurant = await Restaurant.findByPk(restaurantId)
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé'
      })
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await Review.findOne({
      where: {
        userId: req.user.id,
        restaurantId: restaurantId
      }
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis pour ce restaurant'
      })
    }

    // Créer l'avis
    const review = await Review.create({
      userId: req.user.id,
      restaurantId,
      rating,
      comment: comment || ''
    })

    // Recharger avec l'auteur
    const reviewWithAuthor = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name']
      }]
    })

    const data = reviewWithAuthor.toJSON()
    data.authorId = data.userId

    res.status(201).json({
      success: true,
      message: 'Avis ajouté avec succès',
      data: data
    })

  } catch (error) {
    console.error('Erreur ajout avis:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'avis'
    })
  }
})

// Modifier son propre avis
router.put('/:id', [
  protect,
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Le commentaire ne peut pas dépasser 500 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      })
    }

    const review = await Review.findByPk(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      })
    }

    // Vérifier que c'est bien l'auteur ou un admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres avis'
      })
    }

    const { rating, comment } = req.body

    if (rating) review.rating = rating
    if (comment !== undefined) review.comment = comment

    await review.save()

    // Recharger avec l'auteur
    const reviewWithAuthor = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name']
      }]
    })

    const data = reviewWithAuthor.toJSON()
    data.authorId = data.userId

    res.json({
      success: true,
      message: 'Avis modifié avec succès',
      data: data
    })

  } catch (error) {
    console.error('Erreur modification avis:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'avis'
    })
  }
})

// Supprimer un avis (auteur ou admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      })
    }

    // Vérifier que c'est bien l'auteur ou un admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres avis'
      })
    }

    await review.destroy()

    res.json({
      success: true,
      message: 'Avis supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression avis:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis'
    })
  }
})

export default router