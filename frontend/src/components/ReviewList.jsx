import { useState, useEffect } from 'react'
import axios from 'axios'

const ReviewList = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (restaurantId) {
      fetchReviews()
    }
  }, [restaurantId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/restaurant/${restaurantId}`
      )
      setReviews(response.data.data)
    } catch (err) {
      console.error('Erreur chargement avis:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const canDelete = (review, user) => {
    if (!user) return false
    return review.userId === user.id || user.role === 'admin'
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Supprimer cet avis ?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://localhost:5000/api/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchReviews()
    } catch (err) {
      alert('Erreur lors de la suppression')
    }
  }

  if (loading) return <p>Chargement des avis...</p>

  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <p>💬 Aucun avis pour le moment</p>
      </div>
    )
  }

  return (
    <div className="reviews-list">
      <h3>💬 Avis ({reviews.length})</h3>
      {reviews.map((review) => (
        <div key={review.id} className="review-card">
          <div className="review-header">
            <div className="review-author">
              <strong>{review.author?.name || 'Utilisateur'}</strong>
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="review-rating">{renderStars(review.rating)}</div>
          </div>
          {review.comment && (
            <p className="review-comment">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default ReviewList