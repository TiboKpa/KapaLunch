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

function RestaurantList({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || restaurant.type === filterType
    return matchesSearch && matchesType
  })

  const types = ['all', ...new Set(restaurants.map(r => r.type).filter(Boolean))]

  return (
    <div className="restaurant-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher un restaurant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-bar">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          {types.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'Tous les types' : type}
            </option>
          ))}
        </select>
      </div>

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