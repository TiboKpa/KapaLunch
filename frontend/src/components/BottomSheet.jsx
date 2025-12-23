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
  const sheetRef = useRef(null)

  // Ouvrir le sheet quand un restaurant est sélectionné
  useEffect(() => {
    if (selectedRestaurant) {
      setSheetState('semi')
    } else {
      // En mode liste, rester semi-ouvert
      setSheetState('semi')
    }
  }, [selectedRestaurant])

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const deltaY = currentY - startY
    const threshold = 50

    if (Math.abs(deltaY) < threshold) {
      return
    }

    if (deltaY > 0) {
      // Swipe down
      if (sheetState === 'full') {
        setSheetState('semi')
      } else if (sheetState === 'semi') {
        // En mode liste, on ne ferme jamais complètement
        if (!selectedRestaurant) {
          // Rester semi-ouvert
        } else {
          setSheetState('closed')
          onSelectRestaurant(null)
        }
      }
    } else {
      // Swipe up
      if (sheetState === 'closed') {
        setSheetState('semi')
      } else if (sheetState === 'semi') {
        setSheetState('full')
      }
    }
  }

  const handleToggle = () => {
    if (sheetState === 'closed') {
      setSheetState('semi')
    } else if (sheetState === 'semi') {
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

  return (
    <div ref={sheetRef} className={getSheetClass()}>
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

              <div className="mobile-detail-address">
                <span>📍</span>
                <span>{selectedRestaurant.address}, {selectedRestaurant.city}</span>
              </div>

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
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e9ecef', background: '#f8f9fa' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: '600' }}>
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