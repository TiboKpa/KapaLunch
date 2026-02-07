import { useState, useEffect } from 'react'
import axios from 'axios'

const AddReviewForm = ({ restaurantId, onReviewAdded, user, initialRating, initialComment }) => {
  const [rating, setRating] = useState(initialRating || 3)
  const [comment, setComment] = useState(initialComment || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Mettre à jour les valeurs si les props changent
  useEffect(() => {
    if (initialRating !== undefined) {
      setRating(initialRating)
    }
    if (initialComment !== undefined) {
      setComment(initialComment)
    }
  }, [initialRating, initialComment])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/reviews',
        {
          restaurantId,
          rating,
          comment: comment.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess('Avis ajouté avec succès !')
      setRating(3)
      setComment('')

      setTimeout(() => {
        setSuccess('')
        onReviewAdded()
      }, 2000)

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\\'ajout de l\\'avis')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = () => {
    return (
      <div className=\"star-selector-inline\">\n        {[1, 2, 3, 4, 5].map((star) => (
          <button\n            key={star}\n            type=\"button\"\n            onClick={() => setRating(star)}\n            className={`star-btn-svg ${rating >= star ? 'active' : ''}`}\n          >\n            <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill={rating >= star ? '#ffc107' : '#e0e0e0'}>\n              <path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/>\n            </svg>\n          </button>\n        ))}\n        <span className=\"rating-text-inline\">{rating}/5</span>\n      </div>\n    )\n  }

  // Ne pas afficher si pas connecté ou si lurker
  if (!user || user.role === 'lurker') {
    return (
      <div className=\"review-form-blocked\">\n        <p>{!user ? 'Connectez-vous pour laisser un avis' : 'Votre compte doit être validé pour laisser un avis'}</p>\n      </div>\n    )\n  }

  return (
    <div className=\"add-review-form compact\">\n      <div className=\"review-form-header\">\n        <h3>Laisser un avis</h3>\n        {renderStars()}\n      </div>\n\n      <form onSubmit={handleSubmit}>\n        <div className=\"form-group\">\n          <textarea\n            value={comment}\n            onChange={(e) => setComment(e.target.value)}\n            placeholder=\"Commentaire (optionnel)...\"\n            maxLength={500}\n            rows={2}\n          />\n          <small>{comment.length}/500 caractères</small>\n        </div>\n\n        {error && <div className=\"error-message\">{error}</div>}\n        {success && <div className=\"success-message\">{success}</div>}\n\n        <button type=\"submit\" className=\"btn-primary btn-sm\" disabled={loading}>\n          {loading ? 'Envoi...' : 'Publier'}\n        </button>\n      </form>\n    </div>\n  )\n}\n\nexport default AddReviewForm