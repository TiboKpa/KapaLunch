import { useState } from 'react'

function LoginModal({ onClose, onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleChange = (e) => {
    // Retirer le style d'erreur quand l'utilisateur retape
    if (error) {
      setError('')
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setShake(false)

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user, data.token)
        onClose()
      } else {
        // Déclencher l'animation shake
        setShake(true)
        setTimeout(() => setShake(false), 650)
        setError(data.message || 'Email ou mot de passe incorrect')
      }
    } catch (err) {
      // Déclencher l'animation shake
      setShake(true)
      setTimeout(() => setShake(false), 650)
      setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${shake ? 'shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{isSignup ? 'Créer un compte' : 'Se connecter'}</h2>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Votre nom"
                className={error ? 'input-error' : ''}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
              className={error ? 'input-error' : ''}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              minLength="6"
              className={error ? 'input-error' : ''}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Chargement...' : (isSignup ? 'Créer le compte' : 'Se connecter')}
          </button>
        </form>
        <p className="toggle-mode">
          {isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
          <button className="link-btn" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Se connecter' : 'Créer un compte'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginModal