import { useState, useEffect } from 'react'

// Spinner de chargement SVG
const LoadingSpinner = () => (
  <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx=\"12\" cy=\"12\" r=\"10\" opacity=\"0.25\"/>
    <path d=\"M12 2a10 10 0 0 1 10 10\" strokeLinecap=\"round\">\n      <animateTransform\n        attributeName=\"transform\"\n        type=\"rotate\"\n        from=\"0 12 12\"\n        to=\"360 12 12\"\n        dur=\"1s\"\n        repeatCount=\"indefinite\"/>\n    </path>\n  </svg>\n)

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
    \n    // Mots-clés pour chaque type de cuisine
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
    \n    // Chercher une correspondance
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => nameLower.includes(word))) {
        return type
      }
    }
    \n    return null\n  }

  // Fonction pour extraire le nom du restaurant depuis la réponse OSM
  const extractRestaurantName = (displayName) => {
    // Le displayName est souvent au format: \"Nom, Rue, Ville, Pays\"\n    // On prend la première partie avant la première virgule
    const parts = displayName.split(',')\n    return parts[0].trim()\n  }

  // Fonction pour vérifier si un restaurant existe déjà
  const checkDuplicate = (name, address) => {
    const nameLower = name.toLowerCase().trim()\n    const addressLower = address.toLowerCase().trim()\n    \n    return restaurants.find(resto => {
      const restoNameLower = resto.name.toLowerCase().trim()\n      const restoAddressLower = resto.address.toLowerCase().trim()\n      \n      // Vérifier si le nom correspond exactement
      const nameMatch = restoNameLower === nameLower
      \n      // Vérifier si l'adresse contient des éléments similaires
      const addressMatch = addressLower.includes(restoAddressLower) || \n                          restoAddressLower.includes(addressLower)\n      \n      return nameMatch && addressMatch
    })\n  }

  const validateAddress = async () => {
    setGeocodeStatus('validating')
    \n    try {
      const searchQuery = `${formData.name}, ${formData.city}`
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchQuery })
      })\n\n      const geocodeData = await geocodeResponse.json()\n\n      if (geocodeData.success && geocodeData.lat && geocodeData.lon) {
        setGeocodeStatus('success')\n        const fullAddress = geocodeData.displayName || searchQuery
        setFoundAddress(fullAddress)\n        \n        // Extraire le nom exact du restaurant depuis OSM
        const osmName = extractRestaurantName(fullAddress)\n        setExtractedName(osmName)\n        \n        // Mettre à jour le nom dans le formulaire si différent
        if (osmName && osmName.toLowerCase() !== formData.name.toLowerCase()) {
          setFormData(prev => ({ ...prev, name: osmName }))\n        }\n        \n        // Auto-remplir le type de cuisine APRÈS validation de l'adresse
        // Uniquement si le type n'est pas déjà rempli
        if (!formData.type) {
          const nameToAnalyze = osmName || formData.name
          const suggestedType = detectCuisineType(nameToAnalyze)\n          if (suggestedType) {
            setFormData(prev => ({ ...prev, type: suggestedType }))\n            setTypeAutoFilled(true)\n          }\n        }\n      } else {
        setGeocodeStatus('error')\n        setFoundAddress('')\n        setExtractedName('')\n      }\n    } catch (error) {
      console.error('Erreur géocodage:', error)\n      setGeocodeStatus('error')\n      setFoundAddress('')\n      setExtractedName('')\n    }\n  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({\n      ...formData,\n      [name]: value\n    })\n    \n    // Si l'utilisateur modifie manuellement le type, ne plus afficher le badge auto-fill
    if (name === 'type' && value) {
      setTypeAutoFilled(false)\n    }\n  }

  const handleAddressChange = (e) => {
    // Permettre la modification uniquement si l'adresse n'a pas été trouvée
    if (geocodeStatus !== 'success') {
      setFoundAddress(e.target.value)\n    }\n  }

  const handleSubmit = async (e) => {
    e.preventDefault()\n    \n    // Validation du type de cuisine (obligatoire)
    if (!formData.type) {
      showToast('Le type de cuisine est obligatoire', 'error')\n      return\n    }\n    \n    // Validation de l'adresse (obligatoire)
    if (!foundAddress || foundAddress.trim() === '') {
      showToast('L\\'adresse est obligatoire', 'error')\n      return\n    }\n    \n    if (geocodeStatus !== 'success') {
      showToast('Veuillez attendre la validation de l\\'adresse ou saisir l\\'adresse complète manuellement', 'warning')\n      return\n    }\n\n    // Vérifier les doublons
    const finalName = extractedName || formData.name
    const existingRestaurant = checkDuplicate(finalName, foundAddress)\n    \n    if (existingRestaurant) {
      // Restaurant existe déjà - Utiliser Toast au lieu de confirm()
      const reviewData = {
        rating: formData.rating,\n        comment: formData.comment\n      }\n      \n      showToast(
        `L'établissement \"${existingRestaurant.name}\" existe déjà dans la base.`,
        'warning',\n        7000, // Durée plus longue pour laisser le temps de cliquer
        'Voir la fiche',\n        () => onExistingRestaurantFound(existingRestaurant, reviewData)\n      )\n      return\n    }\n\n    setLoading(true)\n\n    try {
      const searchQuery = `${finalName}, ${formData.city}`
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ address: searchQuery })
      })\n\n      const geocodeData = await geocodeResponse.json()\n\n      if (geocodeData.success && geocodeData.lat && geocodeData.lon) {
        const restaurantData = {
          name: finalName,\n          address: foundAddress,\n          type: formData.type,\n          lat: geocodeData.lat,\n          lon: geocodeData.lon,\n          // Premier avis inclus
          initialReview: {
            rating: formData.rating,\n            comment: formData.comment.trim()\n          }\n        }\n\n        await onSubmit(restaurantData)\n        \n        // Reset form
        setFormData({
          name: '',\n          city: '',\n          type: '',\n          rating: 3,\n          comment: ''\n        })\n        setGeocodeStatus('idle')\n        setFoundAddress('')\n        setExtractedName('')\n        setTypeAutoFilled(false)\n        \n        showToast('Établissement ajouté avec succès !', 'success')\n      } else {
        showToast('Impossible de géocoder cette adresse', 'error')\n      }\n    } catch (error) {
      console.error('Erreur ajout restaurant:', error)\n      showToast('Erreur lors de l\\'ajout de l\\'établissement', 'error')\n    } finally {
      setLoading(false)\n    }\n  }

  const renderStarSelector = () => {
    return (
      <div className=\"star-selector\">\n        {[1, 2, 3, 4, 5].map((star) => (
          <button\n            key={star}\n            type=\"button\"\n            onClick={() => setFormData({ ...formData, rating: star })}\n            className={`star-btn-svg ${formData.rating >= star ? 'active' : ''}`}\n          >\n            <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill={formData.rating >= star ? '#ffc107' : '#e0e0e0'}>\n              <path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/>\n            </svg>\n          </button>\n        ))}\n        <span className=\"rating-text\">{formData.rating}/5</span>\n      </div>\n    )\n  }

  // Composant pour les badges de statut inline
  const StatusBadge = ({ status, type = 'geocode' }) => {
    const badges = {
      geocode: {
        validating: { icon: <LoadingSpinner />, title: 'Recherche en cours...', color: '#6c757d' },\n        success: { \n          icon: (
            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" strokeWidth=\"3\">\n              <polyline points=\"20 6 9 17 4 12\" />\n            </svg>\n          ), \n          title: 'Adresse trouvée', \n          color: '#28a745' \n        },\n        error: { \n          icon: (
            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"white\">\n              <path d=\"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z\"/>\n            </svg>\n          ), \n          title: 'Établissement non trouvé', \n          color: '#dc3545' \n        }\n      },\n      address: {
        success: { \n          icon: (
            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" strokeWidth=\"3\">\n              <polyline points=\"20 6 9 17 4 12\" />\n            </svg>\n          ), \n          title: 'Adresse validée', \n          color: '#28a745' \n        }\n      },\n      type: {
        auto: { \n          icon: (
            <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"white\">\n              <path d=\"M20,4C21.11,4 22,4.89 22,6V18C22,19.11 21.11,20 20,20H4C2.89,20 2,19.11 2,18V6C2,4.89 2.89,4 4,4H20M8.5,15V9H7.25V12.5L4.75,9H3.5V15H4.75V11.5L7.3,15H8.5M13.5,10.26V9H9.5V15H13.5V13.75H11V12.64H13.5V11.38H11V10.26H13.5M20.5,14V9H19.25V13.5H18.13V10H16.88V13.5H15.75V9H14.5V14A1,1 0 0,0 15.5,15H19.5A1,1 0 0,0 20.5,14Z\" />\n            </svg>\n          ), \n          title: 'Type détecté automatiquement', \n          color: '#17a2b8' \n        }\n      }\n    }

    const config = type === 'geocode' ? badges.geocode[status] : \n                   type === 'address' ? badges.address[status] :\n                   badges.type[status]

    if (!config) return null

    return (
      <div \n        className=\"status-badge\"\n        title={config.title}\n        style={{\n          position: 'absolute',\n          right: '12px',\n          top: '50%',\n          transform: 'translateY(-50%)',\n          backgroundColor: config.color,\n          color: 'white',\n          width: '24px',\n          height: '24px',\n          borderRadius: '50%',\n          display: 'flex',\n          alignItems: 'center',\n          justifyContent: 'center',\n          fontSize: '13px',\n          fontWeight: 'bold',\n          cursor: 'help',\n          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',\n          zIndex: 10,\n          pointerEvents: 'none'\n        }}\n      >\n        {config.icon}\n      </div>\n    )\n  }

  return (
    <div className=\"add-restaurant-form pop-in\">\n      <h2>Ajouter un établissement</h2>\n      \n      <form onSubmit={handleSubmit}>\n        <div className=\"form-group\">\n          <label>Nom de l&apos;établissement *</label>\n          <div style={{ position: 'relative' }}>\n            <input\n              type=\"text\"\n              name=\"name\"\n              value={formData.name}\n              onChange={handleChange}\n              required\n              placeholder=\"Le Petit Bistrot\"\n              className={geocodeStatus === 'success' ? 'input-success' : geocodeStatus === 'error' ? 'input-error' : ''}\n              style={{ paddingRight: geocodeStatus !== 'idle' && geocodeStatus !== 'success' ? '45px' : undefined }}\n            />\n            {geocodeStatus !== 'idle' && geocodeStatus !== 'success' && <StatusBadge status={geocodeStatus} type=\"geocode\" />}\n          </div>\n        </div>\n\n        <div className=\"form-group\">\n          <label>Ville *</label>\n          <div style={{ position: 'relative' }}>\n            <input\n              type=\"text\"\n              name=\"city\"\n              value={formData.city}\n              onChange={handleChange}\n              required\n              placeholder=\"Lyon\"\n              className={geocodeStatus === 'success' ? 'input-success' : geocodeStatus === 'error' ? 'input-error' : ''}\n              style={{ paddingRight: geocodeStatus !== 'idle' ? '45px' : undefined }}\n            />\n            {geocodeStatus !== 'idle' && <StatusBadge status={geocodeStatus} type=\"geocode\" />}\n          </div>\n        </div>\n\n        <div className=\"form-group\">\n          <label>Adresse complète *</label>\n          <div style={{ position: 'relative' }}>\n            <input\n              type=\"text\"\n              name=\"fullAddress\"\n              value={foundAddress}\n              onChange={handleAddressChange}\n              required\n              placeholder=\"Adresse complète de l'établissement\"\n              disabled={geocodeStatus === 'success'}\n              style={{\n                backgroundColor: geocodeStatus === 'success' ? '#f5f5f5' : 'white',\n                cursor: geocodeStatus === 'success' ? 'not-allowed' : 'text',\n                color: geocodeStatus === 'success' ? '#6c757d' : 'inherit',\n                paddingRight: geocodeStatus === 'success' ? '45px' : undefined\n              }}\n            />\n            {geocodeStatus === 'success' && <StatusBadge status=\"success\" type=\"address\" />}\n          </div>\n        </div>\n\n        <div className=\"form-group\">\n          <label>Type de cuisine *</label>\n          <div style={{ position: 'relative' }}>\n            <select\n              name=\"type\"\n              value={formData.type}\n              onChange={handleChange}\n              required\n              style={{ paddingRight: formData.type && typeAutoFilled ? '45px' : undefined }}\n            >\n              <option value=\"\">Choisir un type</option>\n              <option value=\"Français\">Français</option>\n              <option value=\"Italien\">Italien</option>\n              <option value=\"Japonais\">Japonais</option>\n              <option value=\"Chinois\">Chinois</option>\n              <option value=\"Coréen\">Coréen</option>\n              <option value=\"Vietnamien\">Vietnamien</option>\n              <option value=\"Asiatique\">Asiatique</option>\n              <option value=\"Indien\">Indien</option>\n              <option value=\"Thaïlandais\">Thaïlandais</option>\n              <option value=\"Fast-food\">Fast-food</option>\n              <option value=\"Pizza\">Pizza</option>\n              <option value=\"Burger\">Burger</option>\n              <option value=\"Mexicain\">Mexicain</option>\n              <option value=\"Autre\">Autre</option>\n            </select>\n            {formData.type && typeAutoFilled && <StatusBadge status=\"auto\" type=\"type\" />}\n          </div>\n        </div>\n\n        <div className=\"form-group\">\n          <label>Votre note *</label>\n          {renderStarSelector()}\n        </div>\n\n        <div className=\"form-group\">\n          <label>Votre avis (optionnel)</label>\n          <textarea\n            name=\"comment\"\n            value={formData.comment}\n            onChange={handleChange}\n            placeholder=\"Partagez votre expérience...\"\n            rows=\"3\"\n            maxLength={500}\n          />\n          <small>{formData.comment.length}/500 caractères</small>\n        </div>\n\n        <button \n          type=\"submit\" \n          className=\"btn btn-primary btn-block\"\n          disabled={loading || (geocodeStatus !== 'success' && !foundAddress)}\n        >\n          {loading ? 'Ajout en cours...' : \"Ajouter l'établissement\"}\n        </button>\n      </form>\n    </div>\n  )\n}\n\nexport default AddRestaurantForm