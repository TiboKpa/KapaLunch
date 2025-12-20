import express from 'express'
import axios from 'axios'

const router = express.Router()

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// User-Agent obligatoire pour Nominatim
const headers = {
  'User-Agent': 'KapaLunch/1.0 (kapalunch@example.com)'
}

// Mapping OSM cuisine tags → valeurs françaises
const cuisineMapping = {
  'japanese': 'Japonais',
  'chinese': 'Chinois',
  'korean': 'Coréen',
  'vietnamese': 'Vietnamien',
  'french': 'Français',
  'italian': 'Italien',
  'indian': 'Indien',
  'thai': 'Thaïlandais',
  'mexican': 'Mexicain',
  'american': 'Américain',
  'mediterranean': 'Méditerranéen',
  'pizza': 'Pizza',
  'burger': 'Burger',
  'regional': 'Français'
}

// Rate limiting simple (1 requête par seconde pour Nominatim)
let lastNominatimCall = 0
const NOMINATIM_DELAY = 1000 // 1 seconde

const waitForNominatim = async () => {
  const now = Date.now()
  const timeSinceLastCall = now - lastNominatimCall
  if (timeSinceLastCall < NOMINATIM_DELAY) {
    await new Promise(resolve => setTimeout(resolve, NOMINATIM_DELAY - timeSinceLastCall))
  }
  lastNominatimCall = Date.now()
}

// Recherche via Nominatim
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.trim().length < 3) {
      return res.json([])
    }

    // Rate limiting
    await waitForNominatim()

    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params: {
        q: q.trim(),
        format: 'json',
        addressdetails: 1,
        extratags: 1,
        limit: 5,
        // Filtrer principalement les restaurants et commerces
        'accept-language': 'fr'
      },
      headers,
      timeout: 5000
    })

    res.json(response.data)
  } catch (error) {
    console.error('Erreur Nominatim:', error.message)
    res.status(500).json({ error: 'Erreur lors de la recherche' })
  }
})

// Récupération des détails via Overpass API
router.get('/details', async (req, res) => {
  try {
    const { osm_type, osm_id } = req.query
    
    if (!osm_type || !osm_id) {
      return res.status(400).json({ error: 'osm_type et osm_id requis' })
    }

    // Conversion du type pour Overpass
    const overpassType = osm_type === 'node' ? 'node' : 
                         osm_type === 'way' ? 'way' : 
                         osm_type === 'relation' ? 'relation' : null
    
    if (!overpassType) {
      return res.status(400).json({ error: 'Type OSM invalide' })
    }

    const query = `
      [out:json][timeout:5];
      ${overpassType}(${osm_id});
      out tags;
    `

    const response = await axios.post(OVERPASS_URL, query, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 5000
    })

    const tags = response.data.elements[0]?.tags || {}
    
    // Récupérer le type de cuisine
    let cuisine = null
    if (tags.cuisine) {
      // Le tag peut contenir plusieurs valeurs séparées par ;
      const cuisines = tags.cuisine.split(';').map(c => c.trim().toLowerCase())
      // Prendre la première cuisine reconnue
      for (const c of cuisines) {
        if (cuisineMapping[c]) {
          cuisine = cuisineMapping[c]
          break
        }
      }
    }
    
    // Fallback sur amenity si disponible
    if (!cuisine && tags.amenity === 'fast_food') {
      cuisine = 'Fast-food'
    }

    res.json({ 
      cuisine,
      rawTags: tags // Pour debug
    })
  } catch (error) {
    console.error('Erreur Overpass:', error.message)
    // Ne pas bloquer si Overpass échoue
    res.json({ cuisine: null })
  }
})

export default router