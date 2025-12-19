import { useState } from 'react'

function AddRestaurantForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const geocodeResponse = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: formData.address })
      })

      const geocodeData = await geocodeResponse.json()

      if (geocodeData.success && geocodeData.lat && geocodeData.lon) {
        const restaurantData = {
          ...formData,
          lat: geocodeData.lat,
          lon: geocodeData.lon
        }

        await onSubmit(restaurantData)
        
        setFormData({
          name: '',
          address: '',
          type: '',
          description: ''
        })
      } else {
        alert('Impossible de géocoder cette adresse')
      }
    } catch (error) {
      alert('Erreur lors de l\'ajout du restaurant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-restaurant-form">
      <h2>➕ Ajouter un restaurant</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom du restaurant *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Le Petit Bistrot"
          />
        </div>

        <div className="form-group">
          <label>Adresse complète *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="12 Rue de la Paix, 75001 Paris"
          />
        </div>

        <div className="form-group">
          <label>Type de cuisine</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">Choisir un type</option>
            <option value="Français">Français</option>
            <option value="Italien">Italien</option>
            <option value="Asiatique">Asiatique</option>
            <option value="Fast-food">Fast-food</option>
            <option value="Pizza">Pizza</option>
            <option value="Burger">Burger</option>
            <option value="Japonais">Japonais</option>
            <option value="Indien">Indien</option>
            <option value="Mexicain">Mexicain</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description du restaurant (optionnel)"
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le restaurant'}
        </button>
      </form>
    </div>
  )
}

export default AddRestaurantForm