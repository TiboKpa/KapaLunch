import { useState, useEffect } from 'react'

// Panneau latéral de recherche
export function MobileSearchModal({ isOpen, onClose, searchTerm, setSearchTerm, restaurants, onSelectRestaurant }) {
  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cuisineType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const extractCityPostal = (address) => {
    if (!address) return ''
    const postalMatch = address.match(/(\d{5})\s+([^,]+)/)
    if (postalMatch) {
      return `${postalMatch[2]} - ${postalMatch[1]}`
    }
    return ''
  }

  return (
    <>
      {isOpen && <div className="mobile-panel-overlay" onClick={onClose} />}
      <div className={`mobile-side-panel ${isOpen ? 'open' : ''}`}>
        <div className="mobile-panel-header">
          <button className="btn-panel-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <h3>Rechercher</h3>
        </div>

        <div className="mobile-panel-content">
          <div className="mobile-search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Nom, ville, type de cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </div>

          {searchTerm && (
            <div className="mobile-search-results">
              {filteredRestaurants.length === 0 ? (
                <div className="no-results-message">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <p>Aucun résultat pour "{searchTerm}"</p>
                </div>
              ) : (
                filteredRestaurants.map(restaurant => (
                  <div
                    key={restaurant._id || restaurant.id}
                    className="search-result-item"
                    onClick={() => {
                      onSelectRestaurant(restaurant)
                      onClose()
                    }}
                  >
                    <div className="result-name">{restaurant.name}</div>
                    <div className="result-info">
                      {restaurant.cuisineType && <span className="result-badge">{restaurant.cuisineType}</span>}
                      {restaurant.averageRating > 0 && (
                        <span className="result-rating">
                          ⭐ {restaurant.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {extractCityPostal(restaurant.address) && (
                      <div className="result-location">
                        {extractCityPostal(restaurant.address)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Panneau latéral de filtres
export function MobileFiltersModal({ isOpen, onClose, filters, onFiltersChange, cuisineTypes, cities }) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters = {
      cuisineType: 'Tous',
      city: 'Toutes',
      minRating: 0,
      sortOrder: 'desc'
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  return (
    <>
      {isOpen && <div className="mobile-panel-overlay" onClick={onClose} />}
      <div className={`mobile-side-panel ${isOpen ? 'open' : ''}`}>
        <div className="mobile-panel-header">
          <button className="btn-panel-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <h3>Filtres</h3>
        </div>

        <div className="mobile-panel-content">
          <div className="filter-section">
            <label className="filter-label">Type de cuisine</label>
            <select 
              className="filter-select"
              value={localFilters.cuisineType}
              onChange={(e) => setLocalFilters({...localFilters, cuisineType: e.target.value})}
            >
              <option value="Tous">Tous</option>
              {cuisineTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label className="filter-label">Ville</label>
            <select 
              className="filter-select"
              value={localFilters.city}
              onChange={(e) => setLocalFilters({...localFilters, city: e.target.value})}
            >
              <option value="Toutes">Toutes</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label className="filter-label">Note minimum</label>
            <div className="rating-chips">
              {[0, 3.5, 4, 4.5].map(rating => (
                <button
                  key={rating}
                  className={`rating-chip ${localFilters.minRating === rating ? 'active' : ''}`}
                  onClick={() => setLocalFilters({...localFilters, minRating: rating})}
                >
                  {rating === 0 ? 'Tous' : `⭐ ${rating}+`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Tri par note</label>
            <div className="sort-options">
              <button
                className={`sort-btn ${localFilters.sortOrder === 'desc' ? 'active' : ''}`}
                onClick={() => setLocalFilters({...localFilters, sortOrder: 'desc'})}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                </svg>
                Décroissant
              </button>
              <button
                className={`sort-btn ${localFilters.sortOrder === 'asc' ? 'active' : ''}`}
                onClick={() => setLocalFilters({...localFilters, sortOrder: 'asc'})}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h18v-2H3v2zm0-5h12v-2H3v2zm0-7v2h6V6H3z"/>
                </svg>
                Croissant
              </button>
            </div>
          </div>
        </div>

        <div className="mobile-panel-footer">
          <button className="btn-reset" onClick={handleReset}>
            Réinitialiser
          </button>
          <button className="btn-apply" onClick={handleApply}>
            Appliquer
          </button>
        </div>
      </div>
    </>
  )
}