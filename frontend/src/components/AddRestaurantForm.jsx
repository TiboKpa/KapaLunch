import { useState, useEffect } from 'react'
import axios from 'axios'

function AddRestaurantForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    type: '',
    address: '',
    rating: 3,
    comment: '',
    lat: null,
    lon: null
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [isAddressEditable, setIsAddressEditable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // Types de cuisine avec nouvelles options asiatiques
  const cuisineTypes = [
    'Français',
    'Italien',
    'Japonais',
    'Chinois',
    'Coréen',
    'Vietnamien',
    'Indien',
    'Thaïlandais',
    'Mexicain',
    'Américain',
    'Méditerranéen',
    'Fast-food',
    'Pizza',
    'Burger',
    'Autre'
  ]

  // Recherche avec debouncing (500ms)
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (searchQuery.trim().length < 3) {
      setSuggestions([])
      return
    }

    const timeout = setTimeout(() => {
      searchEstablishment(searchQuery)
    }, 500)

    setSearchTimeout(timeout)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  // Recherche via Nominatim
  const searchEstablishment = async (query) => {
    setIsSearching(true)
    try {
      const response = await axios.get('/api/osm/search', {
        params: { q: query }
      })
      setSuggestions(response.data || [])
    } catch (error) {
      console.error('Erreur recherche:', error)
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  // Sélection d'un établissement depuis les suggestions
  const handleSelectPlace = async (place) => {
    setSelectedPlace(place)
    setSearchQuery(place.display_name)
    setSuggestions([])
    
    // Récupérer le type de cuisine via Overpass
    try {
      const response = await axios.get('/api/osm/details', {
        params: {
          osm_type: place.osm_type,
          osm_id: place.osm_id
        }
      })
      
      setFormData({
        ...formData,
        name: place.name || place.display_name.split(',')[0],
        address: place.display_name,
        city: place.address?.city || place.address?.town || place.address?.village || '',
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        type: response.data.cuisine || '' // Pré-rempli mais modifiable
      })
      
      setIsAddressEditable(false) // Adresse grisée
    } catch (error) {
      console.error('Erreur récupération détails:', error)
      setFormData({
        ...formData,
        name: place.name || place.display_name.split(',')[0],
        address: place.display_name,
        city: place.address?.city || place.address?.town || place.address?.village || '',
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon)
      })
      setIsAddressEditable(false)
    }
  }

  // Basculer en mode saisie manuelle
  const handleManualEntry = () => {
    setIsAddressEditable(true)
    setSelectedPlace(null)
    setSearchQuery('')
    setSuggestions([])
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.type) {
      alert('Le type de cuisine est obligatoire')
      return
    }
    
    if (!formData.address) {
      alert('L\'adresse est obligatoire')
      return
    }
    
    // Si pas de coordonnées GPS, essayer de géocoder l'adresse
    if (!formData.lat || !formData.lon) {
      try {
        const geocodeResponse = await axios.post('/api/geocode', {
          address: `${formData.name}, ${formData.address}`
        })
        
        if (geocodeResponse.data.success) {
          formData.lat = geocodeResponse.data.lat
          formData.lon = geocodeResponse.data.lon
        } else {
          alert('Impossible de géolocaliser cet établissement')
          return
        }
      } catch (error) {
        alert('Erreur lors du géocodage')
        return
      }
    }

    setLoading(true)

    try {
      const restaurantData = {
        name: formData.name,
        address: formData.address,
        type: formData.type,
        lat: formData.lat,
        lon: formData.lon,
        initialReview: {
          rating: formData.rating,
          comment: formData.comment.trim()
        }
      }

      await onSubmit(restaurantData)
      
      // Reset form
      setFormData({
        name: '',
        city: '',
        type: '',
        address: '',
        rating: 3,
        comment: '',
        lat: null,
        lon: null
      })
      setSearchQuery('')
      setSelectedPlace(null)
      setIsAddressEditable(false)
    } catch (error) {
      alert('Erreur lors de l\'ajout de l\'établissement')
    } finally {
      setLoading(false)
    }
  }

  const renderStarSelector = () => {
    return (
      <div className="star-selector">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className={`star-btn-svg ${formData.rating >= star ? 'active' : ''}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill={formData.rating >= star ? '#ffc107' : '#e0e0e0'}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        ))}
        <span className="rating-text">{formData.rating}/5</span>
      </div>
    )
  }

  return (
    <div className="add-restaurant-form pop-in">
      <h2>Ajouter un établissement</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Recherche d'établissement */}
        <div className="form-group">
          <label>Rechercher un établissement</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nom de l'établissement + ville..."
            disabled={selectedPlace !== null}
          />
          {isSearching && <div className="search-status">Recherche...</div>}
          
          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((place, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSelectPlace(place)}
                >
                  <strong>{place.name || place.display_name.split(',')[0]}</strong>
                  <br />
                  <small>{place.display_name}</small>
                </div>
              ))}
            </div>
          )}
          
          {selectedPlace && (
            <div className="selected-place">
              ✓ Établissement trouvé
              <button type="button" onClick={handleManualEntry} className="btn-link">
                Saisir manuellement
              </button>
            </div>
          )}
          
          {!selectedPlace && searchQuery.trim().length >= 3 && suggestions.length === 0 && !isSearching && (
            <div className="no-results">
              Aucun résultat
              <button type="button" onClick={handleManualEntry} className="btn-link">
                Saisir manuellement
              </button>
            </div>
          )}
        </div>

        {/* Nom de l'établissement */}
        <div className="form-group">
          <label>Nom de l'établissement *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Le Petit Bistrot"
          />
        </div>

        {/* Ville */}
        <div className="form-group">
          <label>Ville *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="Lyon"
          />
        </div>

        {/* Type de cuisine (obligatoire) */}
        <div className="form-group">
          <label>Type de cuisine *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Choisir un type</option>
            {cuisineTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Adresse (auto-remplie ou manuelle) */}
        <div className="form-group">
          <label>Adresse *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Adresse complète"
            disabled={!isAddressEditable && selectedPlace !== null}
            className={!isAddressEditable && selectedPlace !== null ? 'input-disabled' : ''}
          />
          {!isAddressEditable && selectedPlace !== null && (
            <small className="text-muted">Adresse récupérée automatiquement</small>
          )}
        </div>

        {/* Note */}
        <div className="form-group">
          <label>Votre note *</label>
          {renderStarSelector()}
        </div>

        {/* Commentaire */}
        <div className="form-group">
          <label>Votre avis (optionnel)</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Partagez votre expérience..."
            rows="3"
            maxLength={1000}
          />
          <small>{formData.comment.length}/1000 caractères</small>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter l\'établissement'}
        </button>
      </form>
      
      <style jsx>{`
        .suggestions-dropdown {
          position: absolute;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-height: 300px;
          overflow-y: auto;
          width: 100%;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .suggestion-item {
          padding: 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .suggestion-item:hover {
          background: #f5f5f5;
        }
        
        .suggestion-item:last-child {
          border-bottom: none;
        }
        
        .selected-place {
          margin-top: 8px;
          padding: 8px;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
          color: #155724;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .no-results {
          margin-top: 8px;
          padding: 8px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .btn-link {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          font-size: 0.9em;
        }
        
        .btn-link:hover {
          color: #0056b3;
        }
        
        .input-disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        
        .text-muted {
          color: #6c757d;
          font-size: 0.85em;
          margin-top: 4px;
          display: block;
        }
        
        .search-status {
          margin-top: 8px;
          color: #6c757d;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  )
}

export default AddRestaurantForm