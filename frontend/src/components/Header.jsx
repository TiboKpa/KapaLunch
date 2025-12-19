import { useState } from 'react'
import LoginModal from './LoginModal'
import ChangePasswordModal from './ChangePasswordModal'
import AdminPanel from './AdminPanel'

function Header({ user, onLogin, onLogout, onToggleAddForm }) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const getRoleBadge = (role) => {
    const badges = {
      admin: { emoji: '🔑', text: 'Admin', color: '#d4af37' },
      user: { emoji: '✅', text: 'Utilisateur', color: '#4caf50' },
      lurker: { emoji: '⏳', text: 'En attente', color: '#ff9800' }
    }
    const badge = badges[role] || badges.lurker
    return (
      <span className="role-badge" style={{ backgroundColor: badge.color }}>
        {badge.emoji} {badge.text}
      </span>
    )
  }

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
              <div className="user-info">
                <span className="user-name">Bonjour, {user.name}</span>
                {getRoleBadge(user.role)}
              </div>

              {/* Bouton ajouter restaurant (user et admin) */}
              {(user.role === 'user' || user.role === 'admin') && (
                <button className="btn btn-primary" onClick={onToggleAddForm}>
                  ➕ Ajouter un restaurant
                </button>
              )}

              {/* Bouton panneau admin (admin uniquement) */}
              {user.role === 'admin' && (
                <button className="btn btn-admin" onClick={() => setShowAdminPanel(true)}>
                  🛠️ Panneau Admin
                </button>
              )}

              {/* Bouton changer mot de passe */}
              <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                🔐 Mot de passe
              </button>

              {/* Bouton déconnexion */}
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

      {/* Modales */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLogin={onLogin}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          user={user}
        />
      )}
    </header>
  )
}

export default Header