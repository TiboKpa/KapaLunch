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
        </div>

        <div className="header-right">
          {user ? (
            <>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>

              {/* Bouton ajouter restaurant (user et admin) */}
              {(user.role === 'user' || user.role === 'admin') && (
                <button className="btn btn-add" onClick={onToggleAddForm}>
                  <span className="btn-icon">➕</span>
                  <span className="btn-text">Ajouter un resto</span>
                </button>
              )}

              {/* Boutons avec icônes utilisateur */}
              <div className="user-actions">
                {/* Bouton panneau admin (admin uniquement) */}
                {user.role === 'admin' && (
                  <button 
                    className="btn-icon-only" 
                    onClick={() => setShowAdminPanel(true)}
                    title="Panneau Admin"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </button>
                )}

                {/* Bouton changer mot de passe */}
                <button 
                  className="btn-icon-only" 
                  onClick={() => setShowPasswordModal(true)}
                  title="Mot de passe"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </button>

                {/* Bouton déconnexion */}
                <button 
                  className="btn-icon-only" 
                  onClick={onLogout}
                  title="Déconnexion"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
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