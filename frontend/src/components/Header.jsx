import { useState } from 'react'
import LoginModal from './LoginModal'

function Header({ user, onLogin, onLogout, onToggleAddForm }) {
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>🍽️ KapaLunch</h1>
          <p className="subtitle">Trouvez votre restaurant</p>
        </div>

        <div className="header-right">
          {user ? (
            <>
              <span className="user-name">Bonjour, {user.name}</span>
              {user.isAdmin && (
                <button className="btn btn-primary" onClick={onToggleAddForm}>
                  ➕ Ajouter un restaurant
                </button>
              )}
              <button className="btn btn-secondary" onClick={onLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowLoginModal(true)}>
              Se connecter
            </button>
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLogin={onLogin}
        />
      )}
    </header>
  )
}

export default Header