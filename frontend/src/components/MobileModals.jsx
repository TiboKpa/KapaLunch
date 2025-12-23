import { useState, useEffect, useRef } from 'react'
import { Search, ArrowLeft, X, Filter, Star } from 'lucide-react'

// Modal de recherche mobile
export function MobileSearchModal({ isOpen, onClose, searchTerm, setSearchTerm, restaurants, onSelectRestaurant }) {
  const inputRef = useRef(null)
  const [filteredResults, setFilteredResults] = useState([])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = restaurants.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredResults(results)
    } else {
      setFilteredResults([])
    }
  }, [searchTerm, restaurants])

  const handleSelectRestaurant = (restaurant) => {
    onSelectRestaurant(restaurant)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={`mobile-search-modal ${isOpen ? 'open' : ''}`}>
      <div className="mobile-search-header">
        <button className="mobile-search-back" onClick={onClose}>
          <ArrowLeft size={24} />
        </button>
        <div className="mobile-search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="mobile-search-input"
            placeholder="Nom, ville, type de cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button 
            className="mobile-search-back" 
            onClick={() => setSearchTerm('')}
            style={{ color: '#dc3545' }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="mobile-search-results">
        {searchTerm.trim() ? (
          <>
            <p style={{ color: '#6c757d', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''}
            </p>
            {filteredResults.map((restaurant) => (
              <div
                key={restaurant.id}
                className="mobile-restaurant-item"
                onClick={() => handleSelectRestaurant(restaurant)}
              >
                <div className="mobile-restaurant-name">{restaurant.name}</div>
                <div className="mobile-restaurant-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={14} fill="#ffc107" color="#ffc107" />
                    <span>{restaurant.averageRating ? restaurant.averageRating.toFixed(1) : 'N/A'}</span>
                  </div>
                  <span>•</span>
                  <span>🍽️ {restaurant.cuisineType}</span>
                  <span>•</span>
                  <span>📍 {restaurant.city}</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '3rem 1rem' }}>
            <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>Recherchez un restaurant par nom, ville ou type de cuisine</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Modal de filtres mobile
export function MobileFiltersModal({ 
  isOpen, 
  onClose, 
  filters,
  onFiltersChange,
  cuisineTypes,
  cities 
}) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

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
  }

  const handleRatingChip = (rating) => {
    setLocalFilters(prev => ({ ...prev, minRating: rating }))
  }

  if (!isOpen) return null

  return (
    <div className={`mobile-filters-modal ${isOpen ? 'open' : ''}`}>
      <div className="mobile-filters-header">
        <h3>Filtres</h3>
        <button className="mobile-filters-close" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="mobile-filters-content">
        {/* Type de cuisine */}
        <div className="mobile-filter-group">
          <label>Type de cuisine</label>
          <select
            value={localFilters.cuisineType}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, cuisineType: e.target.value }))}
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
            value={localFilters.city}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, city: e.target.value }))}
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
            <button
              className={`mobile-rating-chip ${localFilters.minRating === 0 ? 'active' : ''}`}
              onClick={() => handleRatingChip(0)}
            >
              Toutes
            </button>
            <button
              className={`mobile-rating-chip ${localFilters.minRating === 3.5 ? 'active' : ''}`}
              onClick={() => handleRatingChip(3.5)}
            >
              <Star size={14} fill="#ffc107" color="#ffc107" /> 3.5+
            </button>
            <button
              className={`mobile-rating-chip ${localFilters.minRating === 4.0 ? 'active' : ''}`}
              onClick={() => handleRatingChip(4.0)}
            >
              <Star size={14} fill="#ffc107" color="#ffc107" /> 4.0+
            </button>
            <button
              className={`mobile-rating-chip ${localFilters.minRating === 4.5 ? 'active' : ''}`}
              onClick={() => handleRatingChip(4.5)}
            >
              <Star size={14} fill="#ffc107" color="#ffc107" /> 4.5+
            </button>
          </div>
        </div>

        {/* Tri */}
        <div className="mobile-filter-group">
          <label>Tri par note</label>
          <div className="mobile-sort-options">
            <label className={`mobile-sort-option ${localFilters.sortOrder === 'asc' ? 'active' : ''}`}>
              <input
                type="radio"
                name="sortOrder"
                value="asc"
                checked={localFilters.sortOrder === 'asc'}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
              />
              <span>Croissant (- vers +)</span>
            </label>
            <label className={`mobile-sort-option ${localFilters.sortOrder === 'desc' ? 'active' : ''}`}>
              <input
                type="radio"
                name="sortOrder"
                value="desc"
                checked={localFilters.sortOrder === 'desc'}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
              />
              <span>Décroissant (+ vers -)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mobile-filters-footer">
        <button className="mobile-filters-reset" onClick={handleReset}>
          Réinitialiser
        </button>
        <button className="mobile-filters-apply" onClick={handleApply}>
          Appliquer
        </button>
      </div>
    </div>
  )
}

export default { MobileSearchModal, MobileFiltersModal }