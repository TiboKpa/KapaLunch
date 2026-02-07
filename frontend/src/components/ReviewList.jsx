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
        `/api/reviews/restaurant/${restaurantId}`
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
        `/api/reviews/${reviewId}`,
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
      <div className=\"reviews-empty\">\n        <p>💬 Aucun avis pour le moment</p>\n      </div>\n    )\n  }

  return (
    <div className=\"reviews-list\">\n      <h3>💬 Avis ({reviews.length})</h3>\n      {reviews.map((review) => (\n        <div key={review.id} className=\"review-card\">\n          <div className=\"review-header\">\n            <div className=\"review-author\">\n              <strong>{review.author?.name || 'Utilisateur'}</strong>\n              <span className=\"review-date\">\n                {new Date(review.createdAt).toLocaleDateString('fr-FR')}\n              </span>\n            </div>\n            <div className=\"review-rating\">{renderStars(review.rating)}</div>\n          </div>\n          {review.comment && (\n            <p className=\"review-comment\">{review.comment}</p>\n          )}\n        </div>\n      ))}\n    </div>\n  )\n}\n\nexport default ReviewList