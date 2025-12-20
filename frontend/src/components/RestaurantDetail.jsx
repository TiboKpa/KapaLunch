import { useState, useEffect } from 'react'
import axios from 'axios'
import ReviewList from './ReviewList'
import AddReviewForm from './AddReviewForm'

const StarRating = ({ rating }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#ffc107">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id={`half-detail-${i}`}>
              <stop offset="50%" stopColor="#ffc107"/>
              <stop offset="50%" stopColor="#e0e0e0"/>
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#half-detail-${i})`}/>
        </svg>
      )
    } else {
      stars.push(
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#e0e0e0">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    }
  }
  
  return <div className="star-rating-display">{stars}</div>
}

const EditableStars = ({ rating, onChange }) => {
  return (
    <div className="star-selector">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`star-btn-svg ${rating >= star ? 'active' : ''}`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill={rating >= star ? '#ffc107' : '#e0e0e0'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
      <span className="rating-text">{rating}/5</span>
    </div>
  )
}

const RestaurantDetail = ({ restaurant, onClose, user, onRestaurantDeleted, pendingReview, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editFormData, setEditFormData] = useState({ rating: 5, comment: '' })
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: null, id: null })
  const [userHasReview, setUserHasReview] = useState(false)

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

      // Vérifier si l'utilisateur a déjà laissé un avis
      if (user) {
        const hasReview = reviewsData.some(review => review.authorId === user.id)
        setUserHasReview(hasReview)
      }

      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        setAverageRating(avg)
      } else {
        setAverageRating(0)
      }
    } catch (err) {
      console.error('Erreur chargement avis:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewAdded = () => {
    fetchReviews()
    if (onReviewSubmitted) {
      onReviewSubmitted()
    }
  }

  const handleEditReview = (review) => {
    setEditingReviewId(review.id)
    setEditFormData({
      rating: review.rating,
      comment: review.comment || ''
    })
  }

  const handleSaveEdit = async (reviewId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setEditingReviewId(null)
      fetchReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification')
    }
  }

  const handleCancelEdit = () => {
    setEditingReviewId(null)
    setEditFormData({ rating: 5, comment: '' })
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://localhost:5000/api/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      fetchReviews()
      setDeleteConfirm({ show: false, type: null, id: null })
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const handleDeleteRestaurant = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://localhost:5000/api/restaurants/${restaurant.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setDeleteConfirm({ show: false, type: null, id: null })
      onClose()
      if (onRestaurantDeleted) onRestaurantDeleted()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression du restaurant')
    }
  }

  const canEditReview = (review) => {
    if (!user) return false
    return user.id === review.authorId || user.role === 'admin'
  }

  const canDeleteRestaurant = () => {
    if (!user) return false
    return user.id === restaurant.createdBy || user.role === 'admin'
  }

  const showDeleteConfirm = (type, id = null) => {
    setDeleteConfirm({ show: true, type, id })
  }

  const getGoogleMapsUrl = () => {
    // Utiliser les coordonnées GPS pour éviter les problèmes d'encodage
    if (restaurant.lat && restaurant.lon) {
      return `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lon}`
    }
    // Fallback: utiliser l'adresse nettoyée (sans le nom du restaurant)
    const addressWithoutName = restaurant.address.split(',').slice(1).join(',').trim()
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressWithoutName || restaurant.address)}`
  }

  const getCityFromAddress = (address) => {
    // Extraire la ville de l'adresse (dernière partie après la virgule)
    const parts = address.split(',')
    return parts[parts.length - 1].trim()
  }

  if (!restaurant) return null

  return (
    <div className="restaurant-detail-overlay pop-in" onClick={onClose}>
      <div className="restaurant-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div className="restaurant-header">
          <h2>{restaurant.name}</h2>
          
          {/* Ligne unique avec Type, Ville, Note */}
          <div className="restaurant-info-line">
            {restaurant.type && (
              <span className="info-item">
                <span className="info-label">Type:</span>
                <span className="restaurant-type">{restaurant.type}</span>
              </span>
            )}
            
            <span className="info-item">
              <span className="info-icon">📍</span>
              <a 
                href={getGoogleMapsUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="city-link"
                title="Ouvrir dans Google Maps"
              >
                {getCityFromAddress(restaurant.address)}
              </a>
            </span>

            {averageRating > 0 && (
              <span className="info-item rating-inline">
                <StarRating rating={averageRating} />
                <span className="rating-value">{averageRating.toFixed(1)}/5</span>
                <span className="review-count">({reviews.length} avis)</span>
              </span>
            )}
          </div>

          {restaurant.description && (
            <p className="restaurant-description">{restaurant.description}</p>
          )}
        </div>

        <div className="restaurant-content">
          {/* Afficher le formulaire uniquement si l'utilisateur n'a pas déjà laissé un avis */}
          {!userHasReview && (
            <AddReviewForm
              restaurantId={restaurant.id}
              onReviewAdded={handleReviewAdded}
              user={user}
              initialRating={pendingReview?.rating}
              initialComment={pendingReview?.comment}
            />
          )}

          <div className="reviews-section">
            {loading ? (
              <p>Chargement des avis...</p>
            ) : reviews.length === 0 ? (
              <div className="reviews-empty">
                <p>Aucun avis pour le moment</p>
                <p className="empty-subtitle">Soyez le premier à donner votre avis !</p>
              </div>
            ) : (
              <div className="reviews-list">
                <h3>Avis ({reviews.length})</h3>
                {reviews.map((review) => (
                  <div key={review.id} className="review-card pop-in">
                    {editingReviewId === review.id ? (
                      <div className="review-edit-form">
                        <div className="form-group">
                          <label>Note</label>
                          <EditableStars 
                            rating={editFormData.rating}
                            onChange={(rating) => setEditFormData({ ...editFormData, rating })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Commentaire</label>
                          <textarea
                            value={editFormData.comment}
                            onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                            maxLength={500}
                            rows={3}
                          />
                          <small>{editFormData.comment.length}/500 caractères</small>
                        </div>
                        <div className="review-edit-actions">
                          <button 
                            className="btn-success btn-sm"
                            onClick={() => handleSaveEdit(review.id)}
                          >
                            Enregistrer
                          </button>
                          <button 
                            className="btn-secondary btn-sm"
                            onClick={handleCancelEdit}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="review-header">
                          <div className="review-author">
                            <strong>{review.author?.name || 'Utilisateur'}</strong>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="review-header-right">
                            <StarRating rating={review.rating} />
                            {canEditReview(review) && (
                              <div className="review-actions">
                                <button
                                  className="btn-icon"
                                  onClick={() => handleEditReview(review)}
                                  title="Modifier"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                  </svg>
                                </button>
                                <button
                                  className="btn-icon btn-danger-icon"
                                  onClick={() => showDeleteConfirm('review', review.id)}
                                  title="Supprimer"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="review-comment">{review.comment}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bouton supprimer restaurant en bas à gauche */}
        {canDeleteRestaurant() && (
          <button 
            className="btn-delete-restaurant-bottom"
            onClick={() => showDeleteConfirm('restaurant')}
            title="Supprimer le restaurant"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>Supprimer le restaurant</span>
          </button>
        )}

        {deleteConfirm.show && (
          <div className="confirm-overlay" onClick={() => setDeleteConfirm({ show: false, type: null, id: null })}>
            <div className="confirm-modal pop-in" onClick={(e) => e.stopPropagation()}>
              <h3>Confirmer la suppression</h3>
              <p>
                {deleteConfirm.type === 'restaurant' 
                  ? 'Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action est irréversible et supprimera également tous les avis associés.'
                  : 'Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.'}
              </p>
              <div className="confirm-actions">
                <button 
                  className="btn-danger"
                  onClick={() => deleteConfirm.type === 'restaurant' 
                    ? handleDeleteRestaurant() 
                    : handleDeleteReview(deleteConfirm.id)}
                >
                  Supprimer
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setDeleteConfirm({ show: false, type: null, id: null })}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantDetail