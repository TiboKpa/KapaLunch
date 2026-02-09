import { useState, useEffect, useRef, useMemo } from 'react'
import Header from './components/Header'
import Map from './components/Map'
import RestaurantList from './components/RestaurantList'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantDetail from './components/RestaurantDetail'
import Toast from './components/Toast'
import BottomSheet from './components/BottomSheet'
import './styles/App.css'
import './styles/features.css'
import './styles/header-user-panel.css'

function App() {
  const [restaurants, setRestaurants] = useState([])
  const [user, setUser] = useState(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showRestaurantDetail, setShowRestaurantDetail] = useState(false)
  const [showUserPanel, setShowUserPanel] = useState(false)
  const [pendingReview, setPendingReview] = useState(null)
  const [toast, setToast] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [hasActiveFilters, setHasActiveFilters] = useState(false)
  const [mapBounds, setMapBounds] = useState(null)
  
  // Sheet state: 'high' | 'mid' | 'low'
  const [sheetPosition, setSheetPosition] = useState('mid')
  
  const userPanelRef = useRef(null)
  const mapRef = useRef(null)

  // Detect mobile view to conditionally render BottomSheet or classic Sidebar
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadRestaurants()
    checkUserSession()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserPanel && userPanelRef.current && !userPanelRef.current.contains(event.target)) {
        const isUserMenuButton = event.target.closest('.user-menu-trigger')
        if (!isUserMenuButton) {
          setShowUserPanel(false)
        }
      }
    }

    document.addEventListener('click', handleClickOutside, false)
    return () => {
      document.removeEventListener('click', handleClickOutside, false)
    }
  }, [showUserPanel])

  const loadRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants')
      const data = await response.json()
      setRestaurants(data.data || data)
    } catch (error) {
      console.error('Erreur chargement restaurants:', error)
    }
  }

  const checkUserSession = () => {
    const token = localStorage.getItem('token')
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'))
      setUser(userData)
    }
  }

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setShowAddForm(false)
  }

  const handleAddRestaurant = async (newRestaurant) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRestaurant)
      })
      
      if (response.ok) {
        loadRestaurants()
        setShowAddForm(false)
      } else {
        const error = await response.json()
        alert(error.message || "Erreur lors de l'ajout")
      }
    } catch (error) {
      console.error('Erreur ajout restaurant:', error)
      alert("Erreur lors de l'ajout du restaurant")
    }
  }

  const handleSelectRestaurant = (restaurant, reviewData = null) => {
    setSelectedRestaurant(restaurant)
    setShowRestaurantDetail(true)
    setShowAddForm(false)
    setShowUserPanel(false)
    
    // Auto-collapse sheet on selection to show map/detail
    setSheetPosition('low')
    
    if (reviewData) {
      setPendingReview(reviewData)
    }
  }

  const handleRestaurantDeleted = () => {
    loadRestaurants()
    setSelectedRestaurant(null)
    setShowRestaurantDetail(false)
    setSheetPosition('mid')
  }

  const handleLogoClick = () => {
    setSelectedRestaurant(null)
    setShowRestaurantDetail(false)
    setSheetPosition('mid')
    
    if (mapRef.current && mapRef.current.resetView) {
      mapRef.current.resetView()
    }
  }

  const handleToggleAddFormWithSearch = () => {
    setShowAddForm(true)
    // Expand sheet to see form
    if (isMobile) setSheetPosition('high')
  }

  const handleResetFilters = () => {
    setSearchTerm('')
  }

  const showToast = (message, type = 'info', duration = 5000, actionLabel = null, onAction = null) => {
    setToast({
      message,
      type,
      duration,
      actionLabel,
      onAction: onAction ? () => {
        onAction()
        setToast(null)
      } : null
    })
  }
  
  const handleCloseDetail = () => {
    setShowRestaurantDetail(false)
    setSelectedRestaurant(null)
    setPendingReview(null)
    setSheetPosition('mid')
  }

  const canAddRestaurant = user && (user.role === 'user' || user.role === 'admin')

  const visibleRestaurants = useMemo(() => {
    if (!mapBounds) return restaurants

    const inView = (r) => {
      const lat = Number(r.lat)
      const lon = Number(r.lon)
      if (Number.isNaN(lat) || Number.isNaN(lon)) return false
      return (
        lat >= mapBounds.south &&
        lat <= mapBounds.north &&
        lon >= mapBounds.west &&
        lon <= mapBounds.east
      )
    }

    const visibles = restaurants.filter(inView)

    if (selectedRestaurant && !visibles.some(r => (r._id || r.id) === (selectedRestaurant._id || selectedRestaurant.id))) {
      return [selectedRestaurant, ...visibles]
    }

    return visibles
  }, [restaurants, mapBounds, selectedRestaurant])

  // Mobile Bottom Sheet Content
  const renderSidebarContent = () => (
    <>
      {mapBounds && !showAddForm && (
          <div className="area-results" style={{
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(6px)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              fontWeight: '600',
              fontSize: '0.9rem',
              color: '#495057',
              position: 'sticky',
              top: 0,
              zIndex: 10
          }}>
            {visibleRestaurants.length} résultat(s) dans la zone
          </div>
      )}

      {showAddForm && canAddRestaurant && (
        <AddRestaurantForm 
          onSubmit={handleAddRestaurant}
          restaurants={restaurants}
          onExistingRestaurantFound={handleSelectRestaurant}
          showToast={showToast}
          initialName={searchTerm}
        />
      )}

      <RestaurantList 
        restaurants={visibleRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        searchTerm={searchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        canAddRestaurant={canAddRestaurant}
        onOpenAddForm={handleToggleAddFormWithSearch}
        onResetFilters={handleResetFilters}
        onFiltersChange={setHasActiveFilters}
      />
    </>
  )

  return (
    <div className={`app ${showUserPanel ? 'panel-open' : ''}`}>
      <Header 
        user={user} 
        onLogin={handleLogin}
        onLogout={handleLogout}
        onToggleAddForm={() => setShowAddForm(!showAddForm)}
        showUserPanel={showUserPanel}
        setShowUserPanel={setShowUserPanel}
        userPanelRef={userPanelRef}
        onLogoClick={handleLogoClick}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        canAddRestaurant={canAddRestaurant}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="main-container">
        <div className="map-section">
          <Map 
            ref={mapRef}
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={handleSelectRestaurant}
            showUserPanel={showUserPanel}
            showRestaurantDetail={showRestaurantDetail}
            onBoundsChange={setMapBounds}
          />
          
          {showRestaurantDetail && selectedRestaurant && (
            <RestaurantDetail
              restaurant={selectedRestaurant}
              onClose={handleCloseDetail}
              user={user}
              onRestaurantDeleted={handleRestaurantDeleted}
              pendingReview={pendingReview}
              onReviewSubmitted={() => setPendingReview(null)}
            />
          )}
        </div>

        {isMobile ? (
          <BottomSheet 
            defaultPosition={sheetPosition}
            // Use CSS var for header height to ensure perfect sync
            // Use CSS var for low position height to ensure perfect sync with overlay
            positions={{ 
              high: 'calc(100dvh - var(--header-height))', 
              mid: '45vh', 
              low: 'var(--sheet-peek-height)' 
            }}
            onPositionChange={setSheetPosition}
          >
            {renderSidebarContent()}
          </BottomSheet>
        ) : (
          <div className="sidebar">
            {renderSidebarContent()}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.duration}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
        />
      )}
    </div>
  )
}

export default App