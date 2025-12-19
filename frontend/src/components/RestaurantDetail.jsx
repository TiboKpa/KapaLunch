import { useState, useEffect } from 'react'
import axios from 'axios'
import ReviewList from './ReviewList'
import AddReviewForm from './AddReviewForm'

const RestaurantDetail = ({ restaurant, onClose, user }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    if (restaurant) {
      fetchReviews()
    }
  }, [restaurant])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/restaurant/${restaurant.id}`
      )
      const reviewsData = response.data.data
      setReviews(reviewsData)

      // Calculer la moyenne
      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        setAverageRating(avg.toFixed(1))
      } else {
        setAverageRating(0)
      }
    } catch (err) {
      console.error('Erreur chargement avis:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating))
  }

  if (!restaurant) return null

  return (
    <div className="restaurant-detail-overlay" onClick={onClose}>
      <div className="restaurant-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="restaurant-header">
          <h2>{restaurant.name}</h2>
          {restaurant.type && <span className="restaurant-type">{restaurant.type}</span>}
          <p className="restaurant-address">📍 {restaurant.address}</p>

          {averageRating > 0 && (
            <div className="restaurant-rating">
              <span className="stars">{renderStars(parseFloat(averageRating))}</span>
              <span className="rating-value">{averageRating}/5</span>
              <span className="review-count">({reviews.length} avis)</span>
            </div>
          )}

          {restaurant.description && (
            <p className="restaurant-description">{restaurant.description}</p>
          )}
        </div>

        <div className="restaurant-content">
          {/* Formulaire d'ajout d'avis */}
          <AddReviewForm
            restaurantId={restaurant.id}
            onReviewAdded={fetchReviews}
            user={user}
          />

          {/* Liste des avis */}
          <div className="reviews-section">
            {loading ? (
              <p>Chargement des avis...</p>
            ) : reviews.length === 0 ? (
              <div className="reviews-empty">
                <p>💬 Aucun avis pour le moment</p>
                <p className="empty-subtitle">Soyez le premier à donner votre avis !</p>
              </div>
            ) : (
              <div className="reviews-list">
                <h3>💬 Avis ({reviews.length})</h3>
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-author">
                        <strong>👤 {review.author?.name || 'Utilisateur'}</strong>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestaurantDetail