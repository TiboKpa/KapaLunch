// Composant d'affichage des étoiles SVG
const StarRating = ({ rating }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      // Étoile pleine
      stars.push(
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#ffc107" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Demi-étoile
      stars.push(
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="#ffc107"/>
              <stop offset="50%" stopColor="#e0e0e0"/>
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#half-${i})`}/>
        </svg>
      )
    } else {
      // Étoile vide
      stars.push(
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#e0e0e0" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    }
  }
  
  return <div className="star-rating-display">{stars}</div>
}

// Icône étoile pour les boutons de filtres (jaune par défaut)
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffc107" style={{ marginRight: '4px' }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

// Icône pin de localisation
const LocationPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
)

import { useState } from 'react'

function RestaurantList({ restaurants, selectedRestaurant, onSelectRestaurant, searchTerm, showFilters, setShowFilters, canAddRestaurant, onOpenAddForm, onResetFilters }) {
  const [filterType, setFilterType] = useState('all')
  const [filterCity, setFilterCity] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [minRating, setMinRating] = useState(0) // 0, 3.5, 4, 4.5

  // Vérifier si des filtres sont actifs (différents des valeurs par défaut)
  const hasActiveFilters = filterType !== 'all' || filterCity !== 'all' || minRating > 0

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setFilterType('all')
    setFilterCity('all')
    setSortOrder('desc')
    setMinRating(0)
    if (onResetFilters) {
      onResetFilters()
    }
  }

  // Liste des départements français à ignorer
  const FRENCH_DEPARTMENTS = [
    'ain', 'aisne', 'allier', 'alpes-de-haute-provence', 'hautes-alpes', 'alpes-maritimes',
    'ardèche', 'ardennes', 'ariège', 'aube', 'aude', 'aveyron', 'bouches-du-rhône',
    'calvados', 'cantal', 'charente', 'charente-maritime', 'cher', 'corrèze', 'corse',
    'corse-du-sud', 'haute-corse', "c\u00f4te-d'or", "c\u00f4tes-d'armor", 'creuse', 'dordogne',
    'doubs', 'dr\u00f4me', 'eure', 'eure-et-loir', 'finist\u00e8re', 'gard', 'haute-garonne', 'gers',
    'gironde', 'h\u00e9rault', 'ille-et-vilaine', 'indre', 'indre-et-loire', 'is\u00e8re', 'jura',
    'landes', 'loir-et-cher', 'loire', 'haute-loire', 'loire-atlantique', 'loiret',
    'lot', 'lot-et-garonne', 'loz\u00e8re', 'maine-et-loire', 'manche', 'marne', 'haute-marne',
    'mayenne', 'meurthe-et-moselle', 'meuse', 'morbihan', 'moselle', 'ni\u00e8vre', 'nord',
    'oise', 'orne', 'pas-de-calais', 'puy-de-d\u00f4me', 'pyr\u00e9n\u00e9es-atlantiques', 'hautes-pyr\u00e9n\u00e9es',
    'pyr\u00e9n\u00e9es-orientales', 'bas-rhin', 'haut-rhin', 'rh\u00f4ne', 'haute-sa\u00f4ne', 'sa\u00f4ne-et-loire',
    'sarthe', 'savoie', 'haute-savoie', 'paris', 'seine-maritime', 'seine-et-marne',
    'yvelines', 'deux-s\u00e8vres', 'somme', 'tarn', 'tarn-et-garonne', 'var', 'vaucluse',
    'vend\u00e9e', 'vienne', 'haute-vienne', 'vosges', 'yonne', 'territoire de belfort',
    'essonne', 'hauts-de-seine', 'seine-saint-denis', 'val-de-marne', "val-d'oise"
  ]

  // Extraire code postal + ville de l'adresse
  const extractPostalCodeAndCity = (address) => {
    if (!address) return ''
    
    // Chercher le code postal (5 chiffres)
    const postalCodeMatch = address.match(/\b(\d{5})\b/)
    if (!postalCodeMatch) return ''
    
    const postalCode = postalCodeMatch[1]
    const parts = address.split(',')
    
    // Chercher la ville (partie juste avant ou après le code postal)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      if (part.includes(postalCode)) {
        // Le code postal est dans cette partie, extraire la ville
        const cityMatch = part.match(/\d{5}\s+(.+)/)
        if (cityMatch) {
          return `${postalCode} ${cityMatch[1]}`
        }
      }
    }
    
    // Si le code postal est seul à la fin, chercher la ville dans les parties précédentes
    const postalIndex = parts.findIndex(p => p.trim() === postalCode)
    if (postalIndex >= 0) {
      // Chercher la vraie ville (pas le pays, régions ni départements)
      for (let i = postalIndex - 1; i >= 0; i--) {
        const potentialCity = parts[i].trim()
        const lowerCity = potentialCity.toLowerCase()
        
        // Ignorer les pays, régions ET départements
        const isNotCity = lowerCity.includes('france') || 
                         lowerCity.includes('grand est') ||
                         lowerCity.includes('auvergne') ||
                         lowerCity.includes('nouvelle-aquitaine') ||
                         lowerCity.includes('occitanie') ||
                         lowerCity.includes('bretagne') ||
                         lowerCity.includes('normandie') ||
                         lowerCity.includes('pays de la loire') ||
                         lowerCity.includes('centre-val de loire') ||
                         lowerCity.includes('bourgogne') ||
                         lowerCity.includes('hauts-de-france') ||
                         FRENCH_DEPARTMENTS.includes(lowerCity)
        
        if (!isNotCity && potentialCity.length > 0) {
          return `${postalCode} ${potentialCity}`
        }
      }
    }
    
    return postalCode
  }

  // Extraire uniquement la ville (sans le code postal)
  const extractCityOnly = (address) => {
    const postalAndCity = extractPostalCodeAndCity(address)
    // Enlever le code postal pour garder que la ville
    return postalAndCity.replace(/^\d{5}\s*/, '')
  }

  // Obtenir la liste des villes uniques (pour le filtre)
  const cities = ['all', ...new Set(restaurants.map(r => extractCityOnly(r.address)).filter(Boolean))].sort()

  // Filtrage
  let filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || restaurant.type === filterType
    const city = extractCityOnly(restaurant.address)
    const matchesCity = filterCity === 'all' || city === filterCity
    const matchesRating = !restaurant.averageRating || restaurant.averageRating >= minRating
    return matchesSearch && matchesType && matchesCity && matchesRating
  })

  // Tri par note (toujours actif)
  filteredRestaurants = [...filteredRestaurants].sort((a, b) => {
    const ratingA = a.averageRating || 0
    const ratingB = b.averageRating || 0
    return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA
  })

  const types = ['all', ...new Set(restaurants.map(r => r.type).filter(Boolean))]

  // Vérifier si on a une recherche active sans résultats
  const hasSearch = searchTerm.trim().length > 0
  const noResults = hasSearch && filteredRestaurants.length === 0

  return (
    <div className="restaurant-list">
      {/* Panneau de filtres déroulant */}
      {showFilters && (
        <div className="filters-panel pop-in">
          {/* Ligne 1: Type et Ville côte à côte */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Tous' : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Ville</label>
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city === 'all' ? 'Toutes' : city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ligne 2: Tri par note (dropdown) */}
          <div className="filter-group">
            <label>Tri par note</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>

          {/* Ligne 3: Note minimum */}
          <div className="filter-group">
            <label>Note minimum</label>
            <div className="rating-filter-buttons">
              <button 
                className={`rating-btn ${minRating === 0 ? 'active' : ''}`}
                onClick={() => setMinRating(0)}
              >
                Tous
              </button>
              <button 
                className={`rating-btn ${minRating === 3.5 ? 'active' : ''}`}
                onClick={() => setMinRating(3.5)}
              >
                <StarIcon /> 3.5+
              </button>
              <button 
                className={`rating-btn ${minRating === 4 ? 'active' : ''}`}
                onClick={() => setMinRating(4)}
              >
                <StarIcon /> 4.0+
              </button>
              <button 
                className={`rating-btn ${minRating === 4.5 ? 'active' : ''}`}
                onClick={() => setMinRating(4.5)}
              >
                <StarIcon /> 4.5+
              </button>
            </div>
          </div>

          {/* Bouton réinitialiser les filtres */}
          {hasActiveFilters && (
            <button 
              className="btn-reset-filters"
              onClick={resetFilters}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Liste des restaurants */}
      <div className="list-container">
        {noResults ? (
          /* Prompt pour ajouter le restaurant recherché */
          <div className="no-results-prompt">
            <div className="prompt-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#adb5bd">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <p className="prompt-title">Aucun résultat pour "{searchTerm}"</p>
            <p className="prompt-subtitle">Ce restaurant n'est pas encore dans la base</p>
            {canAddRestaurant && (
              <button className="btn-add-searched-restaurant" onClick={onOpenAddForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Ajouter "{searchTerm}"
              </button>
            )}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <p className="no-results">Aucun restaurant trouvé</p>
        ) : (
          filteredRestaurants.map(restaurant => {
            const cityOnly = extractCityOnly(restaurant.address)
            
            return (
              <div
                key={restaurant._id || restaurant.id}
                className={`restaurant-item pop-in ${selectedRestaurant?._id === restaurant._id || selectedRestaurant?.id === restaurant.id ? 'selected' : ''}`}
                onClick={() => onSelectRestaurant(restaurant)}
              >
                {/* Ligne 1: Nom + Note */}
                <div className="restaurant-header-line">
                  <h3>{restaurant.name}</h3>
                  {restaurant.averageRating > 0 && (
                    <div className="restaurant-rating-inline">
                      <StarRating rating={restaurant.averageRating} />
                      <span className="rating-number">{restaurant.averageRating.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>

                {/* Ligne 2: Type + Nom de Ville UNIQUEMENT */}
                <div className="restaurant-info-line">
                  {restaurant.type && <span className="type-badge">{restaurant.type}</span>}
                  {cityOnly && (
                    <div className="city-info">
                      <LocationPin />
                      <span>{cityOnly}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RestaurantList
