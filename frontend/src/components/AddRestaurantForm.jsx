import { useState, useEffect } from 'react'

function AddRestaurantForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    type: '',
    rating: 3,
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [geocodeStatus, setGeocodeStatus] = useState('idle') // idle | validating | success | error
  const [foundAddress, setFoundAddress] = useState('')

  // Auto-geocode dès que nom + ville sont remplis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name.trim() && formData.city.trim()) {
        validateAddress()
      } else {
        setGeocodeStatus('idle')
        setFoundAddress('')
      }
    }, 800) // Délai de 800ms après la dernière frappe

    return () => clearTimeout(timer)
  }, [formData.name, formData.city])

  const validateAddress = async () => {
    setGeocodeStatus('validating')
    
    try {
      const searchQuery = `${formData.name}, ${formData.city}`
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchQuery })
      })

      const geocodeData = await geocodeResponse.json()

      if (geocodeData.success && geocodeData.lat && geocodeData.lon) {
        setGeocodeStatus('success')
        setFoundAddress(geocodeData.displayName || searchQuery)
      } else {
        setGeocodeStatus('error')
        setFoundAddress('')
      }
    } catch (error) {
      setGeocodeStatus('error')
      setFoundAddress('')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddressChange = (e) => {
    // Permettre la modification uniquement si l'adresse n'a pas été trouvée
    if (geocodeStatus !== 'success') {
      setFoundAddress(e.target.value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation du type de cuisine (obligatoire)
    if (!formData.type) {
      alert('Le type de cuisine est obligatoire')
      return
    }
    
    // Validation de l'adresse (obligatoire)
    if (!foundAddress || foundAddress.trim() === '') {
      alert('L\'adresse est obligatoire')
      return
    }
    
    if (geocodeStatus !== 'success') {
      alert('Veuillez attendre la validation de l\'adresse ou saisir l\'adresse complète manuellement')
      return
    }

    setLoading(true)

    try {
      const searchQuery = `${formData.name}, ${formData.city}`
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchQuery })
      })

      const geocodeData = await geocodeResponse.json()

      if (geocodeData.success && geocodeData.lat && geocodeData.lon) {
        const restaurantData = {
          name: formData.name,
          address: foundAddress,
          type: formData.type,
          lat: geocodeData.lat,
          lon: geocodeData.lon,
          // Premier avis inclus
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
          rating: 3,
          comment: ''
        })
        setGeocodeStatus('idle')
        setFoundAddress('')
      } else {
        alert('Impossible de géocoder cette adresse')
      }
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
        <div className="form-group">
          <label>Nom de l'établissement *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Le Petit Bistrot"
            className={geocodeStatus === 'success' ? 'input-success' : geocodeStatus === 'error' ? 'input-error' : ''}
          />
        </div>

        <div className="form-group">
          <label>Ville *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="Lyon"
            className={geocodeStatus === 'success' ? 'input-success' : geocodeStatus === 'error' ? 'input-error' : ''}
          />
        </div>

        {geocodeStatus === 'validating' && (
          <div className="geocode-status validating">
            Recherche de l'adresse...
          </div>
        )}

        {geocodeStatus === 'success' && (
          <div className="geocode-status success">
            ✓ Adresse trouvée : {foundAddress}
          </div>
        )}

        {geocodeStatus === 'error' && (
          <div className="geocode-status error">
            ✗ Établissement non trouvé, vérifiez le nom et la ville
          </div>
        )}

        {/* Champ Adresse en 4ème position */}
        <div className="form-group">
          <label>Adresse complète *</label>
          <input
            type="text"
            name="fullAddress"
            value={foundAddress}
            onChange={handleAddressChange}
            required
            placeholder="Adresse complète de l'établissement"
            disabled={geocodeStatus === 'success'}
            style={{
              backgroundColor: geocodeStatus === 'success' ? '#f5f5f5' : 'white',
              cursor: geocodeStatus === 'success' ? 'not-allowed' : 'text',
              color: geocodeStatus === 'success' ? '#6c757d' : 'inherit'
            }}
          />
          {geocodeStatus === 'success' && (
            <small style={{ color: '#28a745', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
              ✓ Adresse trouvée automatiquement
            </small>
          )}
          {geocodeStatus === 'error' && (
            <small style={{ color: '#dc3545', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>
              ⚠ Établissement non trouvé - Veuillez saisir l'adresse manuellement
            </small>
          )}
        </div>

        <div className="form-group">
          <label>Type de cuisine *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Choisir un type</option>
            <option value="Français">Français</option>
            <option value="Italien">Italien</option>
            <option value="Japonais">Japonais</option>
            <option value="Chinois">Chinois</option>
            <option value="Coréen">Coréen</option>
            <option value="Vietnamien">Vietnamien</option>
            <option value="Asiatique">Asiatique</option>
            <option value="Indien">Indien</option>
            <option value="Thaïlandais">Thaïlandais</option>
            <option value="Fast-food">Fast-food</option>
            <option value="Pizza">Pizza</option>
            <option value="Burger">Burger</option>
            <option value="Mexicain">Mexicain</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label>Votre note *</label>
          {renderStarSelector()}
        </div>

        <div className="form-group">
          <label>Votre avis (optionnel)</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Partagez votre expérience..."
            rows="3"
            maxLength={500}
          />
          <small>{formData.comment.length}/500 caractères</small>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={loading || (geocodeStatus !== 'success' && !foundAddress)}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter l\'établissement'}
        </button>
      </form>
    </div>
  )}
}

export default AddRestaurantForm