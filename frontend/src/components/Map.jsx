import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'

const restaurantIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const Map = forwardRef(({ restaurants, selectedRestaurant, onSelectRestaurant, showUserPanel, showRestaurantDetail }, ref) => {
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const layersRef = useRef({})
  const [mapType, setMapType] = useState('map') // 'map' ou 'satellite'
  const prevSelectedRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  // Détecter le mode mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Exposer les méthodes au parent via ref
  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (!mapRef.current || !restaurants.length) return

      const bounds = L.latLngBounds(
        restaurants
          .filter(r => r.lat && r.lon)
          .map(r => [r.lat, r.lon])
      )

      mapRef.current.flyToBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
        duration: 1.5,
        easeLinearity: 0.15
      })

      prevSelectedRef.current = null
    },
    
    // Méthode pour centrer sur un restaurant (mobile)
    centerOnRestaurant: (restaurant) => {
      if (!mapRef.current || !restaurant || !restaurant.lat || !restaurant.lon) return

      const map = mapRef.current
      const targetZoom = 15
      
      // Sur mobile, calculer l'offset pour centrer sur la partie visible (50% supérieur)
      if (isMobile) {
        const mapSize = map.getSize()
        const bottomSheetHeight = mapSize.y * 0.5 // 50vh de bottom sheet
        
        // Calculer le point cible en tenant compte de la partie cachée
        const targetPoint = map.project([restaurant.lat, restaurant.lon], targetZoom)
        // Décaler vers le haut pour centrer sur la partie visible (25% de la hauteur totale)
        targetPoint.y -= bottomSheetHeight / 2
        const targetLatLng = map.unproject(targetPoint, targetZoom)
        
        map.flyTo(targetLatLng, targetZoom, {
          duration: 0.5,
          easeLinearity: 0.25
        })
      } else {
        map.flyTo([restaurant.lat, restaurant.lon], targetZoom, {
          duration: 0.3,
          easeLinearity: 0.25
        })
      }
    }
  }))

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([46.603354, 1.888334], 6)
      
      layersRef.current.map = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      })
      
      layersRef.current.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      })
      
      layersRef.current.map.addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

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
        // Toujours utiliser l'icône rouge standard
        const marker = L.marker([restaurant.lat, restaurant.lon], { icon: restaurantIcon }).addTo(mapRef.current)
        
        marker.on('click', () => {
          onSelectRestaurant(restaurant)
        })

        markersRef.current.push(marker)
      }
    })
  }, [restaurants, selectedRestaurant, onSelectRestaurant])

  useEffect(() => {
    if (!selectedRestaurant || !selectedRestaurant.lat || !selectedRestaurant.lon || !mapRef.current) return

    const map = mapRef.current
    const isNewRestaurant = prevSelectedRef.current?.id !== selectedRestaurant.id
    prevSelectedRef.current = selectedRestaurant

    const mapSize = map.getSize()
    let offsetX = 0
    let offsetY = 0
    
    // Sur mobile, décaler vers le haut pour compenser le bottom sheet (50vh)
    if (isMobile) {
      const bottomSheetHeight = mapSize.y * 0.5
      // Décaler pour centrer sur la partie visible (les 50% du haut)
      offsetY = -bottomSheetHeight / 2
    } else if (showRestaurantDetail) {
      // Sur desktop, décaler horizontalement pour le panel
      const restaurantPanelWidth = Math.min(600, mapSize.x * 0.5)
      offsetX += restaurantPanelWidth / 2
    }

    if (isNewRestaurant) {
      const targetZoom = 15
      const targetPoint = map.project([selectedRestaurant.lat, selectedRestaurant.lon], targetZoom)
      targetPoint.x += offsetX
      targetPoint.y += offsetY
      const targetLatLng = map.unproject(targetPoint, targetZoom)
      
      map.flyTo(targetLatLng, targetZoom, {
        duration: isMobile ? 0.5 : 1.5,
        easeLinearity: 0.15,
        animate: true
      })
    } else {
      const currentZoom = map.getZoom()
      const targetPoint = map.project([selectedRestaurant.lat, selectedRestaurant.lon], currentZoom)
      targetPoint.x += offsetX
      targetPoint.y += offsetY
      const targetLatLng = map.unproject(targetPoint, currentZoom)
      
      map.flyTo(targetLatLng, currentZoom, {
        duration: 0.8,
        easeLinearity: 0.25,
        animate: true
      })
    }
  }, [selectedRestaurant, showUserPanel, showRestaurantDetail, isMobile])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
})

Map.displayName = 'Map'

export default Map