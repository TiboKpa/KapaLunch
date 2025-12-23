import { useEffect, useRef } from 'react'

export function MobileSearchModal({ isOpen, onClose, searchTerm, setSearchTerm, restaurants, onSelectRestaurant }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectRestaurant = (restaurant) => {
    onSelectRestaurant(restaurant)
    onClose()
  }

  return (
    <div className="mobile-search-modal open">
      <div className="mobile-search-header">
        <button className="btn-back-mobile" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          className="mobile-search-input"
          placeholder="Nom, ville, type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="btn-back-mobile" onClick={() => setSearchTerm('')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="mobile-search-results">
        {searchTerm ? (
          filteredRestaurants.length > 0 ? (
            <>
              <div style={{ padding: '0.75rem 1rem', color: '#6c757d', fontSize: '0.85rem', fontWeight: '500' }}>
                {filteredRestaurants.length} résultat{filteredRestaurants.length > 1 ? 's' : ''}
              </div>
              {filteredRestaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  className="mobile-restaurant-item"
                  onClick={() => handleSelectRestaurant(restaurant)}
                >
                  <div className="mobile-restaurant-name">{restaurant.name}</div>
                  <div className="mobile-restaurant-info">
                    <span className="mobile-restaurant-rating">
                      ⭐ {restaurant.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                    <span>•</span>
                    <span className="mobile-restaurant-city">
                      📍 {restaurant.city}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#adb5bd' }}>
              Aucun restaurant trouvé
            </div>
          )
        ) : (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#adb5bd' }}>
            Commencez à taper pour rechercher
          </div>
        )}
      </div>
    </div>
  )
}

export function MobileFiltersModal({ isOpen, onClose, filters, onFiltersChange, cuisineTypes, cities }) {
  if (!isOpen) return null

  const handleApply = () => {
    onClose()
  }

  const handleReset = () => {
    onFiltersChange({
      cuisineType: 'Tous',
      city: 'Toutes',
      minRating: 0,
      sortOrder: 'desc'
    })
  }

  const ratingOptions = [
    { label: 'Tous', value: 0 },
    { label: '3.5+', value: 3.5 },
    { label: '4.0+', value: 4.0 },
    { label: '4.5+', value: 4.5 }
  ]

  const activeFiltersCount = (
    (filters.cuisineType !== 'Tous' ? 1 : 0) +
    (filters.city !== 'Toutes' ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.sortOrder !== 'desc' ? 1 : 0)
  )

  return (
    <div className="mobile-filters-modal open">
      <div className="mobile-filters-header">
        <h3>Filtres</h3>
        <button className="btn-back-mobile" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mobile-filters-content">
        {/* Type de cuisine */}
        <div className="mobile-filter-group">
          <label>Type de cuisine</label>
          <select
            value={filters.cuisineType}
            onChange={(e) => onFiltersChange({ ...filters, cuisineType: e.target.value })}
          >
            <option value="Tous">Tous</option>
            {cuisineTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Ville */}
        <div className="mobile-filter-group">
          <label>Ville</label>
          <select
            value={filters.city}
            onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
          >
            <option value="Toutes">Toutes</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Note minimum */}
        <div className="mobile-filter-group">
          <label>Note minimum</label>
          <div className="mobile-rating-chips">
            {ratingOptions.map(option => (
              <button
                key={option.value}
                className={`mobile-rating-chip ${filters.minRating === option.value ? 'active' : ''}`}
                onClick={() => onFiltersChange({ ...filters, minRating: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tri */}
        <div className="mobile-filter-group">
          <label>Tri par note</label>
          <div className="mobile-radio-group">
            <div
              className={`mobile-radio-option ${filters.sortOrder === 'asc' ? 'selected' : ''}`}
              onClick={() => onFiltersChange({ ...filters, sortOrder: 'asc' })}
            >
              <input
                type="radio"
                checked={filters.sortOrder === 'asc'}
                onChange={() => {}}
              />
              <span>Croissant</span>
            </div>
            <div
              className={`mobile-radio-option ${filters.sortOrder === 'desc' ? 'selected' : ''}`}
              onClick={() => onFiltersChange({ ...filters, sortOrder: 'desc' })}
            >
              <input
                type="radio"
                checked={filters.sortOrder === 'desc'}
                onChange={() => {}}
              />
              <span>Décroissant</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-filters-footer">
        <button className="btn-mobile-reset" onClick={handleReset}>
          Réinitialiser
        </button>
        <button className="btn-mobile-apply" onClick={handleApply}>
          Appliquer{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
        </button>
      </div>
    </div>
  )
}