import { useState } from 'react'
import axios from 'axios'

const AddReviewForm = ({ restaurantId, onReviewAdded, user }) => {
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:5000/api/reviews',
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
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout de l\'avis')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="star-selector-inline">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`star-btn-svg ${rating >= star ? 'active' : ''}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill={rating >= star ? '#ffc107' : '#e0e0e0'}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        ))}
        <span className="rating-text-inline">{rating}/5</span>
      </div>
    )
  }

  // Ne pas afficher si pas connecté ou si lurker
  if (!user || user.role === 'lurker') {
    return (
      <div className="review-form-blocked">
        <p>{!user ? 'Connectez-vous pour laisser un avis' : 'Votre compte doit être validé pour laisser un avis'}</p>
      </div>
    )
  }

  return (
    <div className="add-review-form compact">
      <div className="review-form-header">
        <h3>Laisser un avis</h3>
        {renderStars()}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Commentaire (optionnel)..."
            maxLength={500}
            rows={2}
          />
          <small>{comment.length}/500 caractères</small>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="btn-primary btn-sm" disabled={loading}>
          {loading ? 'Envoi...' : 'Publier'}
        </button>
      </form>
    </div>
  )
}

export default AddReviewForm