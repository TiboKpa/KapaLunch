import { useState } from 'react'
import axios from 'axios'

const AddReviewForm = ({ restaurantId, onReviewAdded, user }) => {
  const [rating, setRating] = useState(5)
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
      setRating(5)
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

  // Ne pas afficher si pas connecté ou si lurker
  if (!user || user.role === 'lurker') {
    return (
      <div className="review-form-blocked">
        <p>⚠️ {!user ? 'Connectez-vous pour laisser un avis' : 'Votre compte doit être validé pour laisser un avis'}</p>
      </div>
    )
  }

  return (
    <div className="add-review-form">
      <h3>⭐ Laisser un avis</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Note</label>
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${rating >= star ? 'active' : ''}`}
                onClick={() => setRating(star)}
              >
                {rating >= star ? '⭐' : '☆'}
              </button>
            ))}
            <span className="rating-text">{rating}/5</span>
          </div>
        </div>

        <div className="form-group">
          <label>Commentaire (optionnel)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            maxLength={1000}
            rows={4}
          />
          <small>{comment.length}/1000 caractères</small>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Envoi...' : '💬 Publier l\'avis'}
        </button>
      </form>
    </div>
  )
}

export default AddReviewForm