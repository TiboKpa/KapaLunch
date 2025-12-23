import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import Map from './components/Map'
import RestaurantList from './components/RestaurantList'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantDetail from './components/RestaurantDetail'
import Toast from './components/Toast'
import BottomSheet from './components/BottomSheet'
import { MobileSearchModal, MobileFiltersModal } from './components/MobileModals'
import './styles/App.css'
import './styles/features.css'
import './styles/header-user-panel.css'
import './styles/mobile.css'

// Icônes SVG inline
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
)

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

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
  
  // États mobiles
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filters, setFilters] = useState({
    cuisineType: 'Tous',
    city: 'Toutes',
    minRating: 0,
    sortOrder: 'desc'
  })
  
  const userPanelRef = useRef(null)
  const mapRef = useRef(null)

  // Détecter si mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      const response = await fetch('http://localhost:5000/api/restaurants')
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
      const response = await fetch('http://localhost:5000/api/restaurants', {
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
        alert(error.message || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      console.error('Erreur ajout restaurant:', error)
      alert('Erreur lors de l\'ajout du restaurant')
    }
  }

  const handleSelectRestaurant = (restaurant, reviewData = null) => {
    setSelectedRestaurant(restaurant)
    
    if (isMobile) {
      // Sur mobile, recentrer la carte
      if (mapRef.current && mapRef.current.centerOnRestaurant && restaurant) {
        mapRef.current.centerOnRestaurant(restaurant)
      }
    } else {
      // Sur desktop, comportement normal
      setShowRestaurantDetail(true)
      setShowAddForm(false)
    }
    
    setShowUserPanel(false)
    
    if (reviewData) {
      setPendingReview(reviewData)
    }
  }

  const handleRestaurantDeleted = () => {
    loadRestaurants()
    setSelectedRestaurant(null)
    setShowRestaurantDetail(false)
  }

  const handleLogoClick = () => {
    setSelectedRestaurant(null)
    setShowRestaurantDetail(false)
    
    if (mapRef.current && mapRef.current.resetView) {
      mapRef.current.resetView()
    }
  }

  const handleToggleAddFormWithSearch = () => {
    setShowAddForm(true)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilters({
      cuisineType: 'Tous',
      city: 'Toutes',
      minRating: 0,
      sortOrder: 'desc'
    })
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

  const canAddRestaurant = user && (user.role === 'user' || user.role === 'admin')

  // Extraire les types de cuisine et villes uniques
  const cuisineTypes = [...new Set(restaurants.map(r => r.cuisineType))].sort()
  const cities = [...new Set(restaurants.map(r => r.city))].sort()

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
      >
        {/* Boutons mobiles dans le header */}
        {isMobile && (
          <div className="mobile-header-actions">
            <button 
              className="mobile-search-btn"
              onClick={() => setShowMobileSearch(true)}
              aria-label="Rechercher"
            >
              <SearchIcon />
            </button>
            <button 
              className="mobile-filter-btn"
              onClick={() => setShowMobileFilters(true)}
              aria-label="Filtres"
            >
              <FilterIcon />
              {hasActiveFilters && <span className="mobile-filter-badge" />}
            </button>
          </div>
        )}
      </Header>

      <div className="main-container">
        <div className="map-section">
          <Map 
            ref={mapRef}
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={handleSelectRestaurant}
            showUserPanel={showUserPanel}
            showRestaurantDetail={showRestaurantDetail}
          />
          
          {/* RestaurantDetail uniquement sur desktop */}
          {!isMobile && showRestaurantDetail && selectedRestaurant && (
            <RestaurantDetail
              restaurant={selectedRestaurant}
              onClose={() => {
                setShowRestaurantDetail(false)
                setSelectedRestaurant(null)
                setPendingReview(null)
              }}
              user={user}
              onRestaurantDeleted={handleRestaurantDeleted}
              pendingReview={pendingReview}
              onReviewSubmitted={() => setPendingReview(null)}
            />
          )}
        </div>

        {/* Sidebar uniquement sur desktop */}
        {!isMobile && (
          <div className="sidebar">
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
              restaurants={restaurants}
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
        )}
      </div>

      {/* Bottom Sheet pour mobile */}
      {isMobile && (
        <BottomSheet
          restaurants={restaurants}
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={handleSelectRestaurant}
          searchTerm={searchTerm}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          canAddRestaurant={canAddRestaurant}
          onOpenAddForm={handleToggleAddFormWithSearch}
          onResetFilters={handleResetFilters}
          onFiltersChange={setHasActiveFilters}
          user={user}
          onRestaurantDeleted={handleRestaurantDeleted}
          pendingReview={pendingReview}
          onReviewSubmitted={() => setPendingReview(null)}
        />
      )}

      {/* Modals mobiles */}
      {isMobile && (
        <>
          <MobileSearchModal
            isOpen={showMobileSearch}
            onClose={() => setShowMobileSearch(false)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            restaurants={restaurants}
            onSelectRestaurant={handleSelectRestaurant}
          />
          
          <MobileFiltersModal
            isOpen={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            filters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters)
              // Checker si des filtres sont actifs
              const isActive = newFilters.cuisineType !== 'Tous' ||
                              newFilters.city !== 'Toutes' ||
                              newFilters.minRating > 0 ||
                              newFilters.sortOrder !== 'desc'
              setHasActiveFilters(isActive)
            }}
            cuisineTypes={cuisineTypes}
            cities={cities}
          />
        </>
      )}

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