import { useEffect, useRef } from 'react'
import L from 'leaflet'

const restaurantIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function Map({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([46.603354, 1.888334], 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapRef.current)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

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
      
      // Calculer l'offset AVEC le zoom cible
      const targetPoint = map.project([selectedRestaurant.lat, selectedRestaurant.lon], targetZoom)
      
      // Décaler vers la droite pour compenser la popup (environ 25% de la largeur)
      const offsetX = map.getSize().x * 0.25
      targetPoint.x += offsetX
      
      const targetLatLng = map.unproject(targetPoint, targetZoom)
      
      // Animation flyTo avec options personnalisées
      map.flyTo(targetLatLng, targetZoom, {
        duration: 1.5,        // Durée de 1.5 secondes (plus fluide)
        easeLinearity: 0.15,  // Courbe très douce (valeur basse = plus de courbure)
        animate: true
      })
    }
  }, [selectedRestaurant])

  return <div id="map" style={{ width: '100%', height: '100%' }}></div>
}

export default Map