import { useState } from 'react'

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
              className={`restaurant-item ${selectedRestaurant?._id === restaurant._id || selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
              onClick={() => onSelectRestaurant(restaurant)}
            >
              <h3>{restaurant.name}</h3>
              <p className="address">{restaurant.address}</p>
              {restaurant.type && <span className="type-badge">{restaurant.type}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RestaurantList