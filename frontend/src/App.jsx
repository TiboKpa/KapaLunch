import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import Map from './components/Map'
import RestaurantList from './components/RestaurantList'
import AddRestaurantForm from './components/AddRestaurantForm'
import RestaurantDetail from './components/RestaurantDetail'
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
  const [pendingReview, setPendingReview] = useState(null) // Pour stocker avis en attente
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
        // Vérifier aussi que le clic n'est pas sur le bouton d'ouverture
        const isUserMenuButton = event.target.closest('.user-menu-trigger')
        if (!isUserMenuButton) {
          // Fermer le panneau
          setShowUserPanel(false)
        }
      }
    }

    // Utiliser 'click' au lieu de 'mousedown'
    // 'click' se déclenche APRÈS que tous les onClick handlers ont été exécutés
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
    setShowRestaurantDetail(true)
    setShowAddForm(false) // Fermer le formulaire d'ajout
    
    // Stocker les données d'avis si fournies
    if (reviewData) {
      setPendingReview(reviewData)
    }
  }

  const handleRestaurantDeleted = () => {
    loadRestaurants()
    setSelectedRestaurant(null)
    setShowRestaurantDetail(false)
  }

  // Handler pour le clic sur le logo - Retour à la carte globale
  const handleLogoClick = () => {
    // Désélectionner le restaurant
    setSelectedRestaurant(null)
    setShowRestaurantDetail(false)
    
    // TODO: Zoom out sur la carte pour vue globale
    // Sera implémenté dans Map.jsx avec une méthode exposée
  }

  const canAddRestaurant = user && (user.role === 'user' || user.role === 'admin')

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
          />
          
          {/* Popup RestaurantDetail dans la carte */}
          {showRestaurantDetail && selectedRestaurant && (
            <RestaurantDetail
              restaurant={selectedRestaurant}
              onClose={() => {
                setShowRestaurantDetail(false)
                setSelectedRestaurant(null)
                setPendingReview(null) // Réinitialiser les données d'avis
              }}
              user={user}
              onRestaurantDeleted={handleRestaurantDeleted}
              pendingReview={pendingReview}
              onReviewSubmitted={() => setPendingReview(null)}
            />
          )}
        </div>

        <div className="sidebar">
          {showAddForm && canAddRestaurant && (
            <AddRestaurantForm 
              onSubmit={handleAddRestaurant}
              restaurants={restaurants}
              onExistingRestaurantFound={handleSelectRestaurant}
            />
          )}

          <RestaurantList 
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={handleSelectRestaurant}
          />
        </div>
      </div>
    </div>
  )
}

export default App