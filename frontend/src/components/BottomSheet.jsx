import { useState, useEffect, useRef } from 'react'
import { Star, MapPin, X, ChevronUp } from 'lucide-react'

const SHEET_STATES = {
  CLOSED: 'closed',
  PEEK: 'peek',
  HALF: 'half',
  FULL: 'full'
}

function BottomSheet({ restaurant, onClose, onShowDetails, user }) {
  const [state, setState] = useState(SHEET_STATES.PEEK)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const sheetRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (restaurant) {
      setState(SHEET_STATES.HALF)
    } else {
      setState(SHEET_STATES.PEEK)
    }
  }, [restaurant])

  // Gestion du drag
  const handleTouchStart = (e) => {
    // Ne pas drag si on scroll le contenu
    if (contentRef.current && contentRef.current.scrollTop > 0) {
      return
    }
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    setCurrentY(touch.clientY)
    
    // Empêcher le scroll du body pendant le drag
    if (sheetRef.current) {
      const delta = touch.clientY - startY
      if (delta > 0 || state !== SHEET_STATES.PEEK) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const delta = currentY - startY
    const velocity = Math.abs(delta)

    // Déterminer le nouvel état basé sur la direction et vélocité
    if (velocity > 50) {
      if (delta > 0) {
        // Swipe down
        if (state === SHEET_STATES.FULL) setState(SHEET_STATES.HALF)
        else if (state === SHEET_STATES.HALF) setState(SHEET_STATES.PEEK)
        else if (state === SHEET_STATES.PEEK) handleClose()
      } else {
        // Swipe up
        if (state === SHEET_STATES.PEEK) setState(SHEET_STATES.HALF)
        else if (state === SHEET_STATES.HALF) setState(SHEET_STATES.FULL)
      }
    }
  }

  const handleClose = () => {
    setState(SHEET_STATES.CLOSED)
    setTimeout(() => onClose(), 300)
  }

  const handleHandleClick = () => {
    if (state === SHEET_STATES.PEEK) setState(SHEET_STATES.HALF)
    else if (state === SHEET_STATES.HALF) setState(SHEET_STATES.FULL)
    else setState(SHEET_STATES.HALF)
  }

  const getClassName = () => {
    let classes = ['bottom-sheet']
    if (state !== SHEET_STATES.CLOSED) classes.push('open')
    classes.push(`state-${state}`)
    if (!isDragging) classes.push('bouncing')
    return classes.join(' ')
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`sheet-overlay ${state === SHEET_STATES.FULL ? 'visible' : ''}`}
        onClick={() => setState(SHEET_STATES.HALF)}
      />

      {/* Bottom Sheet */}
      <div 
        ref={sheetRef}
        className={getClassName()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Poignée */}
        <div className="sheet-handle" onClick={handleHandleClick}>
          <div className="sheet-handle-bar" />
          {restaurant && (
            <button className="sheet-close-btn" onClick={handleClose}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Contenu */}
        <div ref={contentRef} className="sheet-content">
          {!restaurant ? (
            // Vue peek - Liste des restaurants
            <div className="mobile-restaurant-list">
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '1rem' }}>
                <ChevronUp size={20} style={{ margin: '0 auto' }} />
                <p>Glissez vers le haut pour voir la liste</p>
              </div>
            </div>
          ) : (
            // Restaurant sélectionné
            <div className="mobile-restaurant-detail">
              <div className="mobile-detail-header">
                <h2 className="mobile-detail-name">{restaurant.name}</h2>
                
                <div className="mobile-detail-rating">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < Math.floor(restaurant.averageRating || 0) ? '#ffc107' : 'none'}
                        color={i < Math.floor(restaurant.averageRating || 0) ? '#ffc107' : '#dee2e6'}
                      />
                    ))}
                  </div>
                  <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                    {restaurant.averageRating ? restaurant.averageRating.toFixed(1) : 'N/A'}/5
                  </span>
                  <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    ({restaurant.reviewCount || 0} avis)
                  </span>
                </div>

                <div className="mobile-detail-meta">
                  <div className="mobile-detail-meta-item">
                    <MapPin size={16} />
                    <span>{restaurant.address}, {restaurant.postalCode} {restaurant.city}</span>
                  </div>
                  <div className="mobile-detail-meta-item">
                    <span>🍽️</span>
                    <span>{restaurant.cuisineType}</span>
                  </div>
                </div>
              </div>

              {state === SHEET_STATES.HALF && (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => setState(SHEET_STATES.FULL)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <ChevronUp size={20} />
                    Voir les détails et avis
                  </button>
                </div>
              )}

              {state === SHEET_STATES.FULL && (
                <div className="mobile-reviews-section">
                  <h3 className="mobile-reviews-title">Avis des utilisateurs</h3>
                  
                  {restaurant.reviews && restaurant.reviews.length > 0 ? (
                    restaurant.reviews.map((review, index) => (
                      <div key={index} className="mobile-review-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '600' }}>{review.userName}</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < review.rating ? '#ffc107' : 'none'}
                                  color={i < review.rating ? '#ffc107' : '#dee2e6'}
                                />
                              ))}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {review.comment && (
                          <p style={{ margin: 0, color: '#495057', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                      Aucun avis pour le moment
                    </p>
                  )}

                  {user && (
                    <button
                      onClick={() => onShowDetails(restaurant)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        marginTop: '1rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      + Laisser un avis
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BottomSheet