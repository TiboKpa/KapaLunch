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

    restaurants.forEach(restaurant => {
      if (restaurant.lat && restaurant.lon) {
        const marker = L.marker([restaurant.lat, restaurant.lon], { icon: restaurantIcon }).addTo(mapRef.current)
        marker.bindPopup(`
          <div class="popup-content">
            <h3>${restaurant.name}</h3>
            <p>${restaurant.address}</p>
            ${restaurant.type ? `<p><strong>Type:</strong> ${restaurant.type}</p>` : ''}
          </div>
        `)
        marker.on('click', () => onSelectRestaurant(restaurant))
        markersRef.current.push(marker)
      }
    })
  }, [restaurants, onSelectRestaurant])

  useEffect(() => {
    if (selectedRestaurant && mapRef.current) {
      mapRef.current.setView([selectedRestaurant.lat, selectedRestaurant.lon], 15, { animate: true })
    }
  }, [selectedRestaurant])

  return <div id="map" style={{ width: '100%', height: '100%' }}></div>
}

export default Map