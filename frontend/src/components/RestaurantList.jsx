import { useState } from 'react'

// Composant d'affichage des étoiles SVG
const StarRating = ({ rating }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      // Étoile pleine
      stars.push(
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#ffc107" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Demi-étoile
      stars.push(
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="#ffc107"/>
              <stop offset="50%" stopColor="#e0e0e0"/>
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#half-${i})`}/>
        </svg>
      )
    } else {
      // Étoile vide
      stars.push(
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#e0e0e0" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    }
  }
  
  return <div className="star-rating-display">{stars}</div>
}

// Icône étoile pour les boutons de filtres
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

function RestaurantList({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [minRating, setMinRating] = useState(0) // 0, 3.5, 4, 4.5

  // Vérifier si des filtres sont actifs (différents des valeurs par défaut)
  const hasActiveFilters = filterType !== 'all' || minRating > 0

  // Filtrage
  let filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || restaurant.type === filterType
    const matchesRating = !restaurant.averageRating || restaurant.averageRating >= minRating
    return matchesSearch && matchesType && matchesRating
  })

  // Tri par note (toujours actif)
  filteredRestaurants = [...filteredRestaurants].sort((a, b) => {
    const ratingA = a.averageRating || 0
    const ratingB = b.averageRating || 0
    return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA
  })

  const types = ['all', ...new Set(restaurants.map(r => r.type).filter(Boolean))]

  return (
    <div className="restaurant-list">
      {/* Barre de recherche avec bouton Filtres */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Rechercher un restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={`filter-toggle-btn ${
              showFilters ? 'active' : ''
            } ${
              hasActiveFilters ? 'has-active-filters' : ''
            }`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtres"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
            <span>Filtres</span>
          </button>
        </div>
      </div>

      {/* Panneau de filtres déroulant */}
      {showFilters && (
        <div className="filters-panel pop-in">
          {/* Ligne 1: Type et Tri côte à côte */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Type de restaurant</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Tous les types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Tri par note</label>
              <div className="sort-buttons">
                <button 
                  className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                  onClick={() => setSortOrder('desc')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14l5-5 5 5z"/>
                  </svg>
                  Décroissant
                </button>
                <button 
                  className={`sort-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                  onClick={() => setSortOrder('asc')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                  Croissant
                </button>
              </div>
            </div>
          </div>

          {/* Ligne 2: Note minimum */}
          <div className="filter-group">
            <label>Note minimum</label>
            <div className="rating-filter-buttons">
              <button 
                className={`rating-btn ${minRating === 0 ? 'active' : ''}`}
                onClick={() => setMinRating(0)}
              >
                Tous
              </button>
              <button 
                className={`rating-btn ${minRating === 3.5 ? 'active' : ''}`}
                onClick={() => setMinRating(3.5)}
              >
                <StarIcon /> 3.5+
              </button>
              <button 
                className={`rating-btn ${minRating === 4 ? 'active' : ''}`}
                onClick={() => setMinRating(4)}
              >
                <StarIcon /> 4.0+
              </button>
              <button 
                className={`rating-btn ${minRating === 4.5 ? 'active' : ''}`}
                onClick={() => setMinRating(4.5)}
              >
                <StarIcon /> 4.5+
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des restaurants */}
      <div className="list-container">
        {filteredRestaurants.length === 0 ? (
          <p className="no-results">Aucun restaurant trouvé</p>
        ) : (
          filteredRestaurants.map(restaurant => (
            <div
              key={restaurant._id || restaurant.id}
              className={`restaurant-item pop-in ${selectedRestaurant?._id === restaurant._id || selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
              onClick={() => onSelectRestaurant(restaurant)}
            >
              <h3>{restaurant.name}</h3>
              <p className="address">{restaurant.address}</p>
              {restaurant.averageRating > 0 && (
                <div className="restaurant-rating-preview">
                  <StarRating rating={restaurant.averageRating} />
                  <span className="rating-number">{restaurant.averageRating.toFixed(1)}/5</span>
                </div>
              )}
              {restaurant.type && <span className="type-badge">{restaurant.type}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RestaurantList