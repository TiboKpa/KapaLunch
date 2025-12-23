import { useState, useEffect, useRef } from 'react'
import RestaurantDetail from './RestaurantDetail'

function BottomSheet({ 
  restaurants, 
  selectedRestaurant, 
  onSelectRestaurant,
  searchTerm,
  showFilters,
  setShowFilters,
  canAddRestaurant,
  onOpenAddForm,
  onResetFilters,
  onFiltersChange,
  user,
  onRestaurantDeleted,
  pendingReview,
  onReviewSubmitted
}) {
  const [sheetState, setSheetState] = useState('semi')
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const sheetRef = useRef(null)

  useEffect(() => {
    if (selectedRestaurant) {
      // Afficher directement en mode full pour voir les commentaires
      setSheetState('full')
    } else {
      setSheetState('semi')
    }
  }, [selectedRestaurant])

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const newY = e.touches[0].clientY
    setCurrentY(newY)
    const offset = newY - startY
    setDragOffset(offset)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const deltaY = currentY - startY
    const threshold = 80

    setDragOffset(0)

    if (Math.abs(deltaY) < threshold) {
      return
    }

    if (deltaY > 0) {
      if (sheetState === 'full') {
        setSheetState('semi')
      } else if (sheetState === 'semi') {
        if (selectedRestaurant) {
          onSelectRestaurant(null)
        }
      }
    } else {
      if (sheetState === 'semi') {
        setSheetState('full')
      }
    }
  }

  const handleToggle = () => {
    if (sheetState === 'semi') {
      setSheetState('full')
    } else {
      setSheetState('semi')
    }
  }

  const handleClose = () => {
    if (selectedRestaurant) {
      setSheetState('semi')
      onSelectRestaurant(null)
    }
  }

  const getSheetClass = () => {
    const classes = ['bottom-sheet']
    if (sheetState !== 'closed') classes.push('visible')
    if (sheetState === 'semi') classes.push('semi-open')
    if (sheetState === 'full') classes.push('full-open')
    return classes.join(' ')
  }

  const getTransform = () => {
    if (!isDragging) return 'translateY(0)'
    const maxDragUp = sheetState === 'semi' ? -window.innerHeight * 0.4 : 0
    const maxDragDown = sheetState === 'full' ? window.innerHeight * 0.4 : 100
    const clampedOffset = Math.max(maxDragUp, Math.min(maxDragDown, dragOffset))
    return `translateY(${clampedOffset}px)`
  }

  const extractCityPostal = (address) => {
    if (!address) return ''
    const postalMatch = address.match(/(\d{5})\s+([^,]+)/)
    if (postalMatch) {
      return `${postalMatch[2]} - ${postalMatch[1]}`
    }
    return ''
  }

  // Filtrer les restaurants selon le terme de recherche
  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cuisineType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div 
      ref={sheetRef} 
      className={getSheetClass()}
      style={{ transform: getTransform(), transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)' }}
    >
      <div 
        className="sheet-handle"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleToggle}
      >
        <div className="sheet-handle-bar"></div>
        {selectedRestaurant && (
          <button className="sheet-close-btn" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="sheet-content">
        {selectedRestaurant ? (
          <div className="mobile-restaurant-detail">
            <div className="mobile-detail-header">
              <h2 className="mobile-detail-name">{selectedRestaurant.name}</h2>
              
              <div className="mobile-detail-rating">
                <div style={{ color: '#fbbf24', fontSize: '1.1rem' }}>
                  {'⭐'.repeat(Math.round(selectedRestaurant.averageRating || 0))}
                </div>
                <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                  {selectedRestaurant.averageRating?.toFixed(1) || 'N/A'}/5
                </span>
                <span style={{ color: '#adb5bd', fontSize: '0.85rem' }}>({selectedRestaurant.reviewCount || 0} avis)</span>
              </div>

              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-detail-address"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>{extractCityPostal(selectedRestaurant.address)}</span>
              </a>

              {selectedRestaurant.cuisineType && (
                <div className="mobile-detail-type">
                  <span>{selectedRestaurant.cuisineType}</span>
                </div>
              )}
            </div>

            {/* Afficher RestaurantDetail directement en mode full */}
            <div className="mobile-mini-map">
              <h4>Localisation</h4>
              <button className="btn-view-map" onClick={() => setSheetState('semi')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Voir sur la carte
              </button>
            </div>

            <RestaurantDetail
              restaurant={selectedRestaurant}
              onClose={handleClose}
              user={user}
              onRestaurantDeleted={onRestaurantDeleted}
              pendingReview={pendingReview}
              onReviewSubmitted={onReviewSubmitted}
              isMobileSheet={true}
            />
          </div>
        ) : (
          <>
            <div className="sheet-list-header">
              <h3>{filteredRestaurants.length} restaurant{filteredRestaurants.length > 1 ? 's' : ''}</h3>
            </div>
            
            <div className="mobile-restaurant-grid">
              {filteredRestaurants.map(restaurant => (
                <div
                  key={restaurant._id || restaurant.id}
                  className="mobile-restaurant-card"
                  onClick={() => onSelectRestaurant(restaurant)}
                >
                  <div className="card-header">
                    <h3 className="card-title">{restaurant.name}</h3>
                    {restaurant.averageRating > 0 && (
                      <div className="card-rating">
                        <span className="rating-star">⭐</span>
                        <span className="rating-value">{restaurant.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-info">
                    {restaurant.cuisineType && (
                      <span className="card-badge">{restaurant.cuisineType}</span>
                    )}
                    {extractCityPostal(restaurant.address) && (
                      <div className="card-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span>{extractCityPostal(restaurant.address).split(' - ')[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BottomSheet