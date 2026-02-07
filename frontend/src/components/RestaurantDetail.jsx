import { useState, useEffect } from 'react'
import axios from 'axios'
import ReviewList from './ReviewList'
import AddReviewForm from './AddReviewForm'

const StarRating = ({ rating }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  \n  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <svg key={i} width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"#ffc107\">\n          <path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/>\n        </svg>\n      )\n    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <svg key={i} width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\">\n          <defs>\n            <linearGradient id={`half-detail-${i}`}>\n              <stop offset=\"50%\" stopColor=\"#ffc107\"/>\n              <stop offset=\"50%\" stopColor=\"#e0e0e0\"/>\n            </linearGradient>\n          </defs>\n          <path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\" fill={`url(#half-detail-${i})`}/>\n        </svg>\n      )\n    } else {
      stars.push(
        <svg key={i} width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"#e0e0e0\">\n          <path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/>\n        </svg>\n      )\n    }\n  }\n  \n  return <div className=\"star-rating-display\">{stars}</div>\n}

const EditableStars = ({ rating, onChange }) => {
  return (
    <div className=\"star-selector\">\n      {[1, 2, 3, 4, 5].map((star) => (
        <button\n          key={star}\n          type=\"button\"\n          onClick={() => onChange(star)}\n          className={`star-btn-svg ${rating >= star ? 'active' : ''}`}\n        >\n          <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill={rating >= star ? '#ffc107' : '#e0e0e0'}>\n            <path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/>\n          </svg>\n        </button>\n      ))}\n      <span className=\"rating-text\">{rating}/5</span>\n    </div>\n  )\n}

// Icône pin de localisation (rouge)
const LocationPin = () => (
  <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"#e74c3c\" style={{ marginRight: '4px' }}>\n    <path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\"/>\n  </svg>\n)

// Spinner de chargement
const LoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>\n    <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#666\" strokeWidth=\"2\">\n      <circle cx=\"12\" cy=\"12\" r=\"10\" opacity=\"0.25\"/>\n      <path d=\"M12 2a10 10 0 0 1 10 10\" strokeLinecap=\"round\">\n        <animateTransform\n          attributeName=\"transform\"\n          type=\"rotate\"\n          from=\"0 12 12\"\n          to=\"360 12 12\"\n          dur=\"1s\"\n          repeatCount=\"indefinite\"/>\n      </path>\n    </svg>\n    <span>Chargement des avis...</span>\n  </div>\n)

// Liste des départements français à ignorer
const FRENCH_DEPARTMENTS = [
  'ain', 'aisne', 'allier', 'alpes-de-haute-provence', 'hautes-alpes', 'alpes-maritimes',\n  'ardèche', 'ardennes', 'ariège', 'aube', 'aude', 'aveyron', 'bouches-du-rhône',\n  'calvados', 'cantal', 'charente', 'charente-maritime', 'cher', 'corrèze', 'corse',\n  'corse-du-sud', 'haute-corse', 'côte-d\\'or', 'côtes-d\\'armor', 'creuse', 'dordogne',\n  'doubs', 'drôme', 'eure', 'eure-et-loir', 'finistère', 'gard', 'haute-garonne', 'gers',\n  'gironde', 'hérault', 'ille-et-vilaine', 'indre', 'indre-et-loire', 'isère', 'jura',\n  'landes', 'loir-et-cher', 'loire', 'haute-loire', 'loire-atlantique', 'loiret',\n  'lot', 'lot-et-garonne', 'lozère', 'maine-et-loire', 'manche', 'marne', 'haute-marne',\n  'mayenne', 'meurthe-et-moselle', 'meuse', 'morbihan', 'moselle', 'nièvre', 'nord',\n  'oise', 'orne', 'pas-de-calais', 'puy-de-dôme', 'pyrénées-atlantiques', 'hautes-pyrénées',\n  'pyrénées-orientales', 'bas-rhin', 'haut-rhin', 'rhône', 'haute-saône', 'saône-et-loire',\n  'sarthe', 'savoie', 'haute-savoie', 'paris', 'seine-maritime', 'seine-et-marne',\n  'yvelines', 'deux-sèvres', 'somme', 'tarn', 'tarn-et-garonne', 'var', 'vaucluse',\n  'vendée', 'vienne', 'haute-vienne', 'vosges', 'yonne', 'territoire de belfort',\n  'essonne', 'hauts-de-seine', 'seine-saint-denis', 'val-de-marne', 'val-d\\'oise'\n]

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
        `/api/reviews/restaurant/${restaurant.id}`
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
      rating: review.rating,\n      comment: review.comment || ''\n    })
  }

  const handleSaveEdit = async (reviewId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `/api/reviews/${reviewId}`,
        editFormData,\n        { headers: { Authorization: `Bearer ${token}` } }\n      )
      \n      setEditingReviewId(null)\n      fetchReviews()\n    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification')\n    }\n  }

  const handleCancelEdit = () => {
    setEditingReviewId(null)\n    setEditFormData({ rating: 5, comment: '' })\n  }

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `/api/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }\n      )
      \n      fetchReviews()\n      setDeleteConfirm({ show: false, type: null, id: null })\n    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression')\n    }\n  }

  const handleDeleteRestaurant = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `/api/restaurants/${restaurant.id}`,
        { headers: { Authorization: `Bearer ${token}` } }\n      )
      \n      setDeleteConfirm({ show: false, type: null, id: null })\n      onClose()\n      if (onRestaurantDeleted) onRestaurantDeleted()\n    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression du restaurant')\n    }\n  }

  const canEditReview = (review) => {
    if (!user) return false
    return user.id === review.authorId || user.role === 'admin'\n  }

  const canDeleteRestaurant = () => {
    if (!user) return false
    return user.id === restaurant.createdBy || user.role === 'admin'\n  }

  const showDeleteConfirm = (type, id = null) => {
    setDeleteConfirm({ show: true, type, id })\n  }

  const getGoogleMapsUrl = () => {
    // Utiliser le nom du restaurant + l'adresse complète
    const searchQuery = `${restaurant.name}, ${restaurant.address}`
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`\n  }

  const extractPostalCodeAndCity = (address) => {
    if (!address) return ''\n    \n    // Chercher le code postal (5 chiffres)
    const postalCodeMatch = address.match(/\\b(\\d{5})\\b/)\n    if (!postalCodeMatch) return ''\n    \n    const postalCode = postalCodeMatch[1]\n    const parts = address.split(',')\n    \n    // Chercher la ville (partie juste avant ou après le code postal)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()\n      if (part.includes(postalCode)) {
        // Le code postal est dans cette partie, extraire la ville
        const cityMatch = part.match(/\\d{5}\\s+(.+)/)\n        if (cityMatch) {
          return `${postalCode} ${cityMatch[1]}`\n        }\n      }\n    }\n    \n    // Si le code postal est seul à la fin, chercher la ville dans les parties précédentes
    const postalIndex = parts.findIndex(p => p.trim() === postalCode)\n    if (postalIndex >= 0) {
      // Chercher la vraie ville (pas le pays, régions ni départements)
      for (let i = postalIndex - 1; i >= 0; i--) {
        const potentialCity = parts[i].trim()\n        const lowerCity = potentialCity.toLowerCase()\n        \n        // Ignorer les pays, régions ET départements
        const isNotCity = lowerCity.includes('france') || \n                         lowerCity.includes('grand est') ||\n                         lowerCity.includes('auvergne') ||\n                         lowerCity.includes('nouvelle-aquitaine') ||\n                         lowerCity.includes('occitanie') ||\n                         lowerCity.includes('bretagne') ||\n                         lowerCity.includes('normandie') ||\n                         lowerCity.includes('pays de la loire') ||\n                         lowerCity.includes('centre-val de loire') ||\n                         lowerCity.includes('bourgogne') ||\n                         lowerCity.includes('hauts-de-france') ||\n                         FRENCH_DEPARTMENTS.includes(lowerCity)\n        \n        if (!isNotCity && potentialCity.length > 0) {
          return `${postalCode} ${potentialCity}`\n        }\n      }\n    }\n    \n    return postalCode\n  }

  if (!restaurant) return null

  return (
    <div className=\"restaurant-detail-overlay pop-in\" onClick={onClose}>\n      <div className=\"restaurant-detail\" onClick={(e) => e.stopPropagation()}>\n        <button className=\"close-btn\" onClick={onClose}>\n          <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"white\">\n            <path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"/>\n          </svg>\n        </button>\n\n        <div className=\"restaurant-header\">\n          <h2>{restaurant.name}</h2>\n          \n          {/* Ligne unique avec Type, Code Postal + Ville, Note */}\n          <div className=\"restaurant-info-line\">\n            {restaurant.type && (\n              <span className=\"info-item\">\n                <span className=\"info-label\">Type:</span>\n                <span className=\"restaurant-type\">{restaurant.type}</span>\n              </span>\n            )}\n            \n            <span className=\"info-item\">\n              <LocationPin />\n              <a \n                href={getGoogleMapsUrl()} \n                target=\"_blank\" \n                rel=\"noopener noreferrer\"\n                className=\"city-link\"\n                title=\"Ouvrir dans Google Maps\"\n              >\n                {extractPostalCodeAndCity(restaurant.address)}\n              </a>\n            </span>\n\n            {averageRating > 0 && (\n              <span className=\"info-item rating-inline\">\n                <StarRating rating={averageRating} />\n                <span className=\"rating-value\">{averageRating.toFixed(1)}/5</span>\n                <span className=\"review-count\">({reviews.length} avis)</span>\n              </span>\n            )}\n          </div>\n\n          {restaurant.description && (\n            <p className=\"restaurant-description\">{restaurant.description}</p>\n          )}\n        </div>\n\n        <div className=\"restaurant-content\">\n          {/* Afficher le formulaire uniquement si l'utilisateur n'a pas déjà laissé un avis */}\n          {!userHasReview && (\n            <AddReviewForm\n              restaurantId={restaurant.id}\n              onReviewAdded={handleReviewAdded}\n              user={user}\n              initialRating={pendingReview?.rating}\n              initialComment={pendingReview?.comment}\n            />\n          )}\n\n          <div className=\"reviews-section\">\n            {loading ? (\n              <LoadingSpinner />\n            ) : reviews.length === 0 ? (\n              <div className=\"reviews-empty\">\n                <p>Aucun avis pour le moment</p>\n                <p className=\"empty-subtitle\">Soyez le premier à donner votre avis !</p>\n              </div>\n            ) : (\n              <div className=\"reviews-list\">\n                <h3>Avis ({reviews.length})</h3>\n                {reviews.map((review) => (\n                  <div key={review.id} className=\"review-card pop-in\">\n                    {editingReviewId === review.id ? (\n                      <div className=\"review-edit-form\">\n                        <div className=\"form-group\">\n                          <label>Note</label>\n                          <EditableStars \n                            rating={editFormData.rating}\n                            onChange={(rating) => setEditFormData({ ...editFormData, rating })}\n                          />\n                        </div>\n                        <div className=\"form-group\">\n                          <label>Commentaire</label>\n                          <textarea\n                            value={editFormData.comment}\n                            onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}\n                            maxLength={500}\n                            rows={3}\n                          />\n                          <small>{editFormData.comment.length}/500 caractères</small>\n                        </div>\n                        <div className=\"review-edit-actions\">\n                          <button \n                            className=\"btn-success btn-sm\"\n                            onClick={() => handleSaveEdit(review.id)}\n                          >\n                            Enregistrer\n                          </button>\n                          <button \n                            className=\"btn-secondary btn-sm\"\n                            onClick={handleCancelEdit}\n                          >\n                            Annuler\n                          </button>\n                        </div>\n                      </div>\n                    ) : (\n                      <>\n                        <div className=\"review-header\">\n                          <div className=\"review-author\">\n                            <strong>{review.author?.name || 'Utilisateur'}</strong>\n                            <span className=\"review-date\">\n                              {new Date(review.createdAt).toLocaleDateString('fr-FR', {\n                                day: 'numeric',\n                                month: 'long',\n                                year: 'numeric'\n                              })}\n                            </span>\n                          </div>\n                          <div className=\"review-header-right\">\n                            <StarRating rating={review.rating} />\n                            {canEditReview(review) && (\n                              <div className=\"review-actions\">\n                                <button\n                                  className=\"btn-icon\"\n                                  onClick={() => handleEditReview(review)}\n                                  title=\"Modifier\"\n                                >\n                                  <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n                                    <path d=\"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z\"/>\n                                  </svg>\n                                </button>\n                                <button\n                                  className=\"btn-icon btn-danger-icon\"\n                                  onClick={() => showDeleteConfirm('review', review.id)}\n                                  title=\"Supprimer\"\n                                >\n                                  <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n                                    <path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/>\n                                  </svg>\n                                </button>\n                              </div>\n                            )}\n                          </div>\n                        </div>\n                        {review.comment && (\n                          <p className=\"review-comment\">{review.comment}</p>\n                        )}\n                      </>\n                    )}\n                  </div>\n                ))}\n              </div>\n            )}\n          </div>\n        </div>\n\n        {/* Bouton supprimer restaurant en bas à gauche */}\n        {canDeleteRestaurant() && (\n          <button \n            className=\"btn-delete-restaurant-bottom\"\n            onClick={() => showDeleteConfirm('restaurant')}\n            title=\"Supprimer le restaurant\"\n          >\n            <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\">\n              <path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/>\n            </svg>\n            <span>Supprimer le restaurant</span>\n          </button>\n        )}\n\n        {deleteConfirm.show && (\n          <div className=\"confirm-overlay\" onClick={() => setDeleteConfirm({ show: false, type: null, id: null })}>\n            <div className=\"confirm-modal pop-in\" onClick={(e) => e.stopPropagation()}>\n              <h3>Confirmer la suppression</h3>\n              <p>\n                {deleteConfirm.type === 'restaurant' \n                  ? 'Êtes-vous sûr de vouloir supprimer ce restaurant ? Cette action est irréversible et supprimera également tous les avis associés.'\n                  : 'Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.'}\n              </p>\n              <div className=\"confirm-actions\">\n                <button \n                  className=\"btn-danger\"\n                  onClick={() => deleteConfirm.type === 'restaurant' \n                    ? handleDeleteRestaurant() \n                    : handleDeleteReview(deleteConfirm.id)}\n                >\n                  Supprimer\n                </button>\n                <button \n                  className=\"btn-secondary\"\n                  onClick={() => setDeleteConfirm({ show: false, type: null, id: null })}\n                >\n                  Annuler\n                </button>\n              </div>\n            </div>\n          </div>\n        )}\n      </div>\n    </div>\n  )\n}

export default RestaurantDetail