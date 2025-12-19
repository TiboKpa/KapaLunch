import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import axios from 'axios'

const restaurantIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function Map({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [reviewsCache, setReviewsCache] = useState({})

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([46.603354, 1.888334], 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  const fetchReviews = async (restaurantId) => {
    if (reviewsCache[restaurantId]) {
      return reviewsCache[restaurantId]
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/reviews/restaurant/${restaurantId}`
      )
      const reviews = response.data.data
      setReviewsCache(prev => ({ ...prev, [restaurantId]: reviews }))
      return reviews
    } catch (err) {
      console.error('Erreur chargement avis:', err)
      return []
    }
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const createPopupContent = (restaurant, reviews) => {
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

    const reviewsHtml = reviews.slice(0, 3).map(review => `
      <div class="popup-review">
        <div class="popup-review-header">
          <strong>👤 ${review.author?.name || 'Utilisateur'}</strong>
          <span>${renderStars(review.rating)}</span>
        </div>
        ${review.comment ? `<p class="popup-review-comment">${review.comment.substring(0, 100)}${review.comment.length > 100 ? '...' : ''}</p>` : ''}
      </div>
    `).join('')

    return `
      <div class="popup-content">
        <h3>${restaurant.name}</h3>
        <p>📍 ${restaurant.address}</p>
        ${restaurant.type ? `<p><strong>Type:</strong> ${restaurant.type}</p>` : ''}
        
        ${averageRating ? `
          <div class="popup-rating">
            <span class="popup-stars">${renderStars(Math.round(parseFloat(averageRating)))}</span>
            <span>${averageRating}/5 (${reviews.length} avis)</span>
          </div>
        ` : '<p class="popup-no-reviews">💬 Aucun avis</p>'}
        
        ${reviews.length > 0 ? `
          <div class="popup-reviews">
            <h4>Derniers avis :</h4>
            ${reviewsHtml}
            ${reviews.length > 3 ? `<p class="popup-more">+ ${reviews.length - 3} autre(s) avis</p>` : ''}
          </div>
        ` : ''}
        
        <button class="popup-btn" onclick="alert('Détails complets - implémenté dans le panneau latéral')">Voir les détails</button>
      </div>
    `
  }

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    restaurants.forEach(async (restaurant) => {
      if (restaurant.lat && restaurant.lon) {
        const marker = L.marker([restaurant.lat, restaurant.lon], { icon: restaurantIcon }).addTo(mapRef.current)
        
        // Charger les avis lors du clic sur le marker
        marker.on('click', async () => {
          const reviews = await fetchReviews(restaurant.id)
          const popupContent = createPopupContent(restaurant, reviews)
          marker.setPopupContent(popupContent)
          onSelectRestaurant(restaurant)
        })

        // Popup de base (sans avis pour éviter de charger tous les avis au démarrage)
        marker.bindPopup(`
          <div class="popup-content">
            <h3>${restaurant.name}</h3>
            <p>📍 ${restaurant.address}</p>
            ${restaurant.type ? `<p><strong>Type:</strong> ${restaurant.type}</p>` : ''}
            <p class="popup-loading">Chargement des avis...</p>
          </div>
        `)

        markersRef.current.push(marker)
      }
    })
  }, [restaurants, onSelectRestaurant])

  useEffect(() => {
    if (selectedRestaurant && mapRef.current) {
      mapRef.current.setView([selectedRestaurant.lat, selectedRestaurant.lon], 15, { animate: true })
    }
  }, [selectedRestaurant])

  return <div id="map" style={{ width: '100%', height: '100%' }}></div>
}

export default Map