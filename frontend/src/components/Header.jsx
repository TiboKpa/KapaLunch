import { useState } from 'react'
import LoginModal from './LoginModal'
import ChangePasswordModal from './ChangePasswordModal'
import AdminPanel from './AdminPanel'

function Header({ user, onLogin, onLogout, onToggleAddForm }) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showUserPanel, setShowUserPanel] = useState(false)

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
        {/* Logo à gauche */}
        <div className="header-left">
          <h1>🍽️ KapaLunch</h1>
        </div>

        {/* Bouton ajouter au centre */}
        <div className="header-center">
          {user && (user.role === 'user' || user.role === 'admin') && (
            <button className="btn btn-add" onClick={onToggleAddForm}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>Ajouter un resto</span>
            </button>
          )}
        </div>

        {/* Menu utilisateur à droite */}
        <div className="header-right">
          {user ? (
            <button 
              className="user-menu-trigger"
              onClick={() => setShowUserPanel(!showUserPanel)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>{user.name}</span>
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowLoginModal(true)}>
              Se connecter
            </button>
          )}
        </div>
      </div>

      {/* Panneau utilisateur coulissant depuis la droite */}
      {showUserPanel && (
        <>
          <div 
            className="user-panel-overlay" 
            onClick={() => setShowUserPanel(false)}
          />
          <div className="user-panel">
            <div className="user-panel-header">
              <h3>Mon compte</h3>
              <button 
                className="user-panel-close"
                onClick={() => setShowUserPanel(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="user-panel-content">
              <div className="user-panel-info">
                <div className="user-panel-avatar">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="user-panel-name">{user.name}</div>
                {getRoleBadge(user.role)}
              </div>

              <div className="user-panel-actions">
                {/* Panneau admin */}
                {user.role === 'admin' && (
                  <button 
                    className="user-panel-action-btn"
                    onClick={() => {
                      setShowAdminPanel(true)
                      setShowUserPanel(false)
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <div className="action-btn-content">
                      <span className="action-btn-title">Panneau Admin</span>
                      <span className="action-btn-description">Gérer les utilisateurs</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="action-btn-chevron">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </button>
                )}

                {/* Changer mot de passe */}
                <button 
                  className="user-panel-action-btn"
                  onClick={() => {
                    setShowPasswordModal(true)
                    setShowUserPanel(false)
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <div className="action-btn-content">
                    <span className="action-btn-title">Changer le mot de passe</span>
                    <span className="action-btn-description">Modifier vos identifiants</span>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="action-btn-chevron">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>

                {/* Déconnexion */}
                <button 
                  className="user-panel-action-btn user-panel-action-btn-danger"
                  onClick={() => {
                    onLogout()
                    setShowUserPanel(false)
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <div className="action-btn-content">
                    <span className="action-btn-title">Déconnexion</span>
                    <span className="action-btn-description">Quitter votre session</span>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="action-btn-chevron">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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