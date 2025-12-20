import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

const restaurantIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function Map({ restaurants, selectedRestaurant, onSelectRestaurant, showUserPanel, showRestaurantDetail }) {
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const layersRef = useRef({})
  const [mapType, setMapType] = useState('map') // 'map' ou 'satellite'

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([46.603354, 1.888334], 6)
      
      // Création des deux couches
      layersRef.current.map = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      })
      
      layersRef.current.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      })
      
      // Ajouter la couche par défaut
      layersRef.current.map.addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Changer de couche quand mapType change
  useEffect(() => {
    if (!mapRef.current || !layersRef.current.map || !layersRef.current.satellite) return

    if (mapType === 'map') {
      layersRef.current.satellite.remove()
      layersRef.current.map.addTo(mapRef.current)
    } else {
      layersRef.current.map.remove()
      layersRef.current.satellite.addTo(mapRef.current)
    }
  }, [mapType])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    restaurants.forEach((restaurant) => {
      if (restaurant.lat && restaurant.lon) {
        const marker = L.marker([restaurant.lat, restaurant.lon], { icon: restaurantIcon }).addTo(mapRef.current)
        
        // Clic sur le marker sélectionne le restaurant (pas de popup)
        marker.on('click', () => {
          onSelectRestaurant(restaurant)
        })

        markersRef.current.push(marker)
      }
    })
  }, [restaurants, onSelectRestaurant])

  useEffect(() => {
    if (selectedRestaurant && selectedRestaurant.lat && selectedRestaurant.lon && mapRef.current) {
      const map = mapRef.current
      const targetZoom = 15
      
      // Calculer l'offset en fonction des panneaux ouverts
      const mapSize = map.getSize()
      let offsetX = 0
      
      // Si fiche resto ouverte : décaler vers la gauche (600px max)
      if (showRestaurantDetail) {
        const restaurantPanelWidth = Math.min(600, mapSize.x * 0.5) // 50% max
        offsetX -= restaurantPanelWidth / 2
      }
      
      // Si panneau user ouvert : décaler vers la gauche (380px)
      if (showUserPanel) {
        offsetX -= 380 / 2
      }
      
      // Projeter avec le zoom cible
      const targetPoint = map.project([selectedRestaurant.lat, selectedRestaurant.lon], targetZoom)
      targetPoint.x += offsetX
      
      const targetLatLng = map.unproject(targetPoint, targetZoom)
      
      // Animation flyTo avec options personnalisées
      map.flyTo(targetLatLng, targetZoom, {
        duration: 1.5,
        easeLinearity: 0.15,
        animate: true
      })
    }
  }, [selectedRestaurant, showUserPanel, showRestaurantDetail])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Sélecteur de type de carte */}
      <div className="map-type-selector">
        <button 
          className={`map-type-btn ${mapType === 'map' ? 'active' : ''}`}
          onClick={() => setMapType('map')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
          </svg>
          <span>Carte</span>
        </button>
        <button 
          className={`map-type-btn ${mapType === 'satellite' ? 'active' : ''}`}
          onClick={() => setMapType('satellite')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Satellite</span>
        </button>
      </div>
      
      <div id="map" style={{ width: '100%', height: '100%' }}></div>
    </div>
  )
}

export default Map