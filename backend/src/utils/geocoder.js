import axios from 'axios'

export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': process.env.NOMINATIM_USER_AGENT || 'KapaLunch'
      }
    })

    if (response.data && response.data.length > 0) {
      const result = response.data[0]
      
      return {
        success: true,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name
      }
    }

    return {
      success: false,
      message: 'Aucune coordonnée trouvée pour cette adresse'
    }

  } catch (error) {
    console.error('Erreur géocodage:', error.message)
    
    return {
      success: false,
      message: 'Erreur lors du géocodage',
      error: error.message
    }
  }
}

export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json'
      },
      headers: {
        'User-Agent': process.env.NOMINATIM_USER_AGENT || 'KapaLunch'
      }
    })

    if (response.data) {
      return {
        success: true,
        address: response.data.display_name
      }
    }

    return {
      success: false,
      message: 'Aucune adresse trouvée'
    }

  } catch (error) {
    console.error('Erreur géocodage inversé:', error.message)
    
    return {
      success: false,
      message: 'Erreur lors du géocodage inversé',
      error: error.message
    }
  }
}