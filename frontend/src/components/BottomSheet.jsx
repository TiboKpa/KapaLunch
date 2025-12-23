import { useState, useEffect, useRef } from 'react'
import RestaurantList from './RestaurantList'
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
  const [sheetState, setSheetState] = useState('semi') // 'closed', 'semi', 'full'
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const sheetRef = useRef(null)

  // Ouvrir le sheet quand un restaurant est sélectionné
  useEffect(() => {
    if (selectedRestaurant) {
      setSheetState('semi')
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

    // Reset offset
    setDragOffset(0)

    // Snap vers la position la plus proche
    if (Math.abs(deltaY) < threshold) {
      return // Rester à la position actuelle
    }

    if (deltaY > 0) {
      // Swipe down
      if (sheetState === 'full') {
        setSheetState('semi')
      } else if (sheetState === 'semi') {
        // Ne jamais fermer complètement en mode liste
        if (selectedRestaurant) {
          onSelectRestaurant(null)
        }
      }
    } else {
      // Swipe up
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

  // Calculer le transform en fonction du drag
  const getTransform = () => {
    if (!isDragging) return 'translateY(0)'
    
    // Limiter le drag vers le haut (ne pas dépasser full)
    const maxDragUp = sheetState === 'semi' ? -window.innerHeight * 0.4 : 0
    // Limiter le drag vers le bas
    const maxDragDown = sheetState === 'full' ? window.innerHeight * 0.4 : 100
    
    const clampedOffset = Math.max(maxDragUp, Math.min(maxDragDown, dragOffset))
    return `translateY(${clampedOffset}px)`
  }

  // Extraire code postal + ville
  const extractCityPostal = (address) => {
    if (!address) return ''
    const postalMatch = address.match(/(\d{5})\s+([^,]+)/)
    if (postalMatch) {
      return `${postalMatch[2]} - ${postalMatch[1]}`
    }
    return ''
  }

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
                <span>📍</span>
                <span>{extractCityPostal(selectedRestaurant.address)}</span>
              </a>

              <div className="mobile-detail-type">
                <span>🍽️</span>
                <span>{selectedRestaurant.cuisineType}</span>
              </div>
            </div>

            {sheetState === 'full' && (
              <>
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
              </>
            )}

            {sheetState === 'semi' && (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: '#adb5bd', fontSize: '0.85rem' }}>
                Glissez vers le haut pour voir les avis
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#2c3e50', fontWeight: '600' }}>
                {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''}
              </h3>
            </div>
            <RestaurantList
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={onSelectRestaurant}
              searchTerm={searchTerm}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              canAddRestaurant={canAddRestaurant}
              onOpenAddForm={onOpenAddForm}
              onResetFilters={onResetFilters}
              onFiltersChange={onFiltersChange}
              isMobile={true}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default BottomSheet