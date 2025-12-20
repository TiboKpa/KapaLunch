import { useState, useEffect } from 'react'

// Spinner de chargement SVG
const LoadingSpinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="10" opacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="1s"
        repeatCount="indefinite"/>
    </path>
  </svg>
)

function AddRestaurantForm({ onSubmit, restaurants = [], onExistingRestaurantFound, showToast, initialName = '' }) {
  const [formData, setFormData] = useState({
    name: initialName,
    city: '',
    type: '',
    rating: 3,
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [geocodeStatus, setGeocodeStatus] = useState('idle') // idle | validating | success | error
  const [foundAddress, setFoundAddress] = useState('')
  const [extractedName, setExtractedName] = useState('') // Nom extrait d'OSM
  const [typeAutoFilled, setTypeAutoFilled] = useState(false) // Pour savoir si le type a été auto-rempli

  // Mettre à jour le nom si initialName change
  useEffect(() => {
    if (initialName) {
      setFormData(prev => ({ ...prev, name: initialName }))
    }
  }, [initialName])

  // Auto-geocode dès que nom + ville sont remplis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name.trim() && formData.city.trim()) {
        validateAddress()
      } else {
        setGeocodeStatus('idle')
        setFoundAddress('')
        setExtractedName('')
      }
    }, 800) // Délai de 800ms après la dernière frappe

    return () => clearTimeout(timer)
  }, [formData.name, formData.city])

  const detectCuisineType = (name) => {
    const nameLower = name.toLowerCase()
    
    // Mots-clés pour chaque type de cuisine
    const keywords = {
      'Japonais': ['sushi', 'ramen', 'tokyo', 'osaka', 'sakura', 'bento', 'izakaya', 'yakitori', 'udon', 'wasabi', 'maki'],
      'Chinois': ['china', 'chinois', 'wok', 'canton', 'pékin', 'beijing', 'shanghai', 'dim sum', 'dragon'],
      'Coréen': ['korea', 'coréen', 'seoul', 'bibimbap', 'kimchi', 'bulgogi'],
      'Vietnamien': ['vietnam', 'vietnamien', 'pho', 'saigon', 'hanoi', 'banh mi', 'bo bun'],
      'Indien': ['india', 'indien', 'taj', 'mumbai', 'delhi', 'curry', 'tandoori', 'masala'],
      'Thaïlandais': ['thai', 'thaï', 'bangkok', 'pad thai'],
      'Italien': ['pizza', 'pizzeria', 'pasta', 'trattoria', 'italia', 'italien', 'roma', 'napoli', 'venezia', 'toscana', 'sicilia', 'ristorante'],
      'Mexicain': ['mexico', 'mexicain', 'tacos', 'burrito', 'azteca', 'mariachi', 'tex mex'],
      'Burger': ['burger', 'five guys', 'smash'],
      'Fast-food': ['quick', 'fast', 'express', 'drive', 'speed', 'mc', 'kfc', 'subway'],
      'Français': ['bistrot', 'brasserie', 'auberge', 'chez']
    }
    
    // Chercher une correspondance
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => nameLower.includes(word))) {
        return type
      }
    }
    
    return null
  }

  // Fonction pour extraire le nom du restaurant depuis la réponse OSM
  const extractRestaurantName = (displayName) => {
    // Le displayName est souvent au format: "Nom, Rue, Ville, Pays"
    // On prend la première partie avant la première virgule
    const parts = displayName.split(',')
    return parts[0].trim()
  }

  // Fonction pour vérifier si un restaurant existe déjà
  const checkDuplicate = (name, address) => {
    const nameLower = name.toLowerCase().trim()
    const addressLower = address.toLowerCase().trim()
    
    return restaurants.find(resto => {
      const restoNameLower = resto.name.toLowerCase().trim()
      const restoAddressLower = resto.address.toLowerCase().trim()
      
      // Vérifier si le nom correspond exactement
      const nameMatch = restoNameLower === nameLower
      
      // Vérifier si l'adresse contient des éléments similaires
      const addressMatch = addressLower.includes(restoAddressLower) || 
                          restoAddressLower.includes(addressLower)
      
      return nameMatch && addressMatch
    })
  }

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
        const fullAddress = geocodeData.displayName || searchQuery
        setFoundAddress(fullAddress)
        
        // Extraire le nom exact du restaurant depuis OSM
        const osmName = extractRestaurantName(fullAddress)
        setExtractedName(osmName)
        
        // Mettre à jour le nom dans le formulaire si différent
        if (osmName && osmName.toLowerCase() !== formData.name.toLowerCase()) {
          setFormData(prev => ({ ...prev, name: osmName }))
        }
        
        // Auto-remplir le type de cuisine APRÈS validation de l'adresse
        // Uniquement si le type n'est pas déjà rempli
        if (!formData.type) {
          const nameToAnalyze = osmName || formData.name
          const suggestedType = detectCuisineType(nameToAnalyze)
          if (suggestedType) {
            setFormData(prev => ({ ...prev, type: suggestedType }))
            setTypeAutoFilled(true)
          }
        }
      } else {
        setGeocodeStatus('error')
        setFoundAddress('')
        setExtractedName('')
      }
    } catch (error) {
      setGeocodeStatus('error')
      setFoundAddress('')
      setExtractedName('')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Si l'utilisateur modifie manuellement le type, ne plus afficher le badge auto-fill
    if (name === 'type' && value) {
      setTypeAutoFilled(false)
    }
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
      showToast('Le type de cuisine est obligatoire', 'error')
      return
    }
    
    // Validation de l'adresse (obligatoire)
    if (!foundAddress || foundAddress.trim() === '') {
      showToast('L\'adresse est obligatoire', 'error')
      return
    }
    
    if (geocodeStatus !== 'success') {
      showToast('Veuillez attendre la validation de l\'adresse ou saisir l\'adresse complète manuellement', 'warning')
      return
    }

    // Vérifier les doublons
    const finalName = extractedName || formData.name
    const existingRestaurant = checkDuplicate(finalName, foundAddress)
    
    if (existingRestaurant) {
      // Restaurant existe déjà - Utiliser Toast au lieu de confirm()
      const reviewData = {
        rating: formData.rating,
        comment: formData.comment
      }
      
      showToast(
        `L'\u00e9tablissement "${existingRestaurant.name}" existe déjà dans la base.`,
        'warning',
        7000, // Durée plus longue pour laisser le temps de cliquer
        'Voir la fiche',
        () => onExistingRestaurantFound(existingRestaurant, reviewData)
      )
      return
    }

    setLoading(true)

    try {
      const searchQuery = `${finalName}, ${formData.city}`
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchQuery })
      })

      const geocodeData = await geocodeResponse.json()

      if (geocodeData.success && geocodeData.lat && geocodeData.lon) {
        const restaurantData = {
          name: finalName,
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
        setExtractedName('')
        setTypeAutoFilled(false)
        
        showToast('Établissement ajouté avec succès !', 'success')
      } else {
        showToast('Impossible de géocoder cette adresse', 'error')
      }
    } catch (error) {
      console.error('Erreur ajout restaurant:', error)
      showToast('Erreur lors de l\'ajout de l\'établissement', 'error')
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

  // Composant pour les badges de statut inline
  const StatusBadge = ({ status, type = 'geocode' }) => {
    const badges = {
      geocode: {
        validating: { icon: <LoadingSpinner />, title: 'Recherche en cours...', color: '#6c757d' },
        success: { 
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ), 
          title: 'Adresse trouvée', 
          color: '#28a745' 
        },
        error: { 
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          ), 
          title: 'Établissement non trouvé', 
          color: '#dc3545' 
        }
      },
      address: {
        success: { 
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ), 
          title: 'Adresse validée', 
          color: '#28a745' 
        }
      },
      type: {
        auto: { 
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M20,4C21.11,4 22,4.89 22,6V18C22,19.11 21.11,20 20,20H4C2.89,20 2,19.11 2,18V6C2,4.89 2.89,4 4,4H20M8.5,15V9H7.25V12.5L4.75,9H3.5V15H4.75V11.5L7.3,15H8.5M13.5,10.26V9H9.5V15H13.5V13.75H11V12.64H13.5V11.38H11V10.26H13.5M20.5,14V9H19.25V13.5H18.13V10H16.88V13.5H15.75V9H14.5V14A1,1 0 0,0 15.5,15H19.5A1,1 0 0,0 20.5,14Z" />
            </svg>
          ), 
          title: 'Type détecté automatiquement', 
          color: '#17a2b8' 
        }
      }
    }

    const config = type === 'geocode' ? badges.geocode[status] : 
                   type === 'address' ? badges.address[status] :
                   badges.type[status]

    if (!config) return null

    return (
      <div 
        className="status-badge"
        title={config.title}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: config.color,
          color: 'white',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: 'help',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {config.icon}
      </div>
    )
  }

  return (
    <div className="add-restaurant-form pop-in">
      <h2>Ajouter un établissement</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom de l&apos;établissement *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Le Petit Bistrot"
              className={geocodeStatus === 'success' ? 'input-success' : geocodeStatus === 'error' ? 'input-error' : ''}
              style={{ paddingRight: geocodeStatus !== 'idle' && geocodeStatus !== 'success' ? '45px' : undefined }}
            />
            {geocodeStatus !== 'idle' && geocodeStatus !== 'success' && <StatusBadge status={geocodeStatus} type="geocode" />}
          </div>
        </div>

        <div className="form-group">
          <label>Ville *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="Lyon"
              className={geocodeStatus === 'success' ? 'input-success' : geocodeStatus === 'error' ? 'input-error' : ''}
              style={{ paddingRight: geocodeStatus !== 'idle' ? '45px' : undefined }}
            />
            {geocodeStatus !== 'idle' && <StatusBadge status={geocodeStatus} type="geocode" />}
          </div>
        </div>

        <div className="form-group">
          <label>Adresse complète *</label>
          <div style={{ position: 'relative' }}>
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
                color: geocodeStatus === 'success' ? '#6c757d' : 'inherit',
                paddingRight: geocodeStatus === 'success' ? '45px' : undefined
              }}
            />
            {geocodeStatus === 'success' && <StatusBadge status="success" type="address" />}
          </div>
        </div>

        <div className="form-group">
          <label>Type de cuisine *</label>
          <div style={{ position: 'relative' }}>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={{ paddingRight: formData.type && typeAutoFilled ? '45px' : undefined }}
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
            {formData.type && typeAutoFilled && <StatusBadge status="auto" type="type" />}
          </div>
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
          {loading ? 'Ajout en cours...' : "Ajouter l'établissement"}
        </button>
      </form>
    </div>
  )
}

export default AddRestaurantForm
