import { useState, useEffect, useRef, useMemo } from 'react'
import Header from './components/Header'
import Map from './components/Map'
import RestaurantList from './components/RestaurantList'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantDetail from './components/RestaurantDetail'
import Toast from './components/Toast'
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
  const [showFilters, setShowFilters] = useState(false) // État du panneau de filtres
  const [hasActiveFilters, setHasActiveFilters] = useState(false) // État des filtres actifs
  const [mapBounds, setMapBounds] = useState(null) // { south, west, north, east } ou null
  
  // État pour le bottom sheet mobile : 'mid' (65vh) ou 'low' (22vh)
  const [sheetPosition, setSheetPosition] = useState('mid')
  
  const userPanelRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    loadRestaurants()
    checkUserSession()
  }, [])

  // Fermer le panneau utilisateur au clic en dehors
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
    
    // Sur mobile, on passe en mode 'bas' pour laisser la place à la fiche détail
    setSheetPosition('low')
    
    if (reviewData) {
      setPendingReview(reviewData)
    }
  }

  const handleRestaurantDeleted = () => {
    loadRestaurants()
    setSelectedRestaurant(null)
    setShowRestaurantDetail(false)
    setSheetPosition('mid') // Retour en position standard
  }

  const handleLogoClick = () => {
    setSelectedRestaurant(null)
    setShowRestaurantDetail(false)
    setSheetPosition('mid') // Retour en position standard
    
    if (mapRef.current && mapRef.current.resetView) {
      mapRef.current.resetView()
    }
  }

  // Handler pour ouvrir le formulaire d'ajout avec le searchTerm pré-rempli
  const handleToggleAddFormWithSearch = () => {
    setShowAddForm(true)
    // Optionnel : passer en 'mid' si on veut voir le formulaire en entier
    setSheetPosition('mid') 
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
  
  // Fermeture du détail : on revient en mode liste (mid)
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

        {/* Sidebar avec gestion dynamique de la classe de hauteur */}
        <div className={`sidebar ${sheetPosition === 'low' ? 'sheet-low' : 'sheet-mid'}`}>
          {/* Poignée de redimensionnement/toggle */}
          <div 
            className="sheet-handle-bar" 
            onClick={() => setSheetPosition(prev => prev === 'mid' ? 'low' : 'mid')}
            title={sheetPosition === 'mid' ? "Réduire" : "Agrandir"}
          >
            <div className="sheet-handle"></div>
          </div>

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
                  top: '0', /* Juste sous le handle (qui est relatif/sticky) */
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
        </div>
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
