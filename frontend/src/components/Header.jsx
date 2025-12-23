import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminUsersModal from './AdminUsersModal'

function Header({ user, onLogin, onLogout, onToggleAddForm, showUserPanel, setShowUserPanel, userPanelRef, onLogoClick, searchTerm, setSearchTerm, canAddRestaurant, showFilters, setShowFilters, onResetFilters }) {
  // États des différentes sections du panneau
  const [panelView, setPanelView] = useState('menu') // 'menu', 'login'
  const [showPasswordDropdown, setShowPasswordDropdown] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  
  // États login/signup
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  
  // États changement mot de passe
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const getRoleBadge = (role) => {
    const badges = {
      admin: { text: 'Admin', color: '#d4af37', icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      )},
      user: { text: 'Utilisateur', color: '#4caf50', icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/>
        </svg>
      )},
      lurker: { text: 'En attente', color: '#ff9800', icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
      )}
    }
    const badge = badges[role] || badges.lurker
    return (
      <span className="role-badge" style={{ backgroundColor: badge.color }}>
        {badge.icon} {badge.text}
      </span>
    )
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      const endpoint = isSignup ? 'http://localhost:5000/api/auth/signup' : 'http://localhost:5000/api/auth/login'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user, data.token)
        handleClosePanel()
      } else {
        setAuthError(data.message || 'Erreur lors de la connexion')
      }
    } catch (err) {
      setAuthError('Erreur de connexion au serveur')
    } finally {
      setAuthLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setPasswordLoading(true)

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        'http://localhost:5000/api/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setPasswordSuccess('Mot de passe changé avec succès !')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        setShowPasswordDropdown(false)
        setPasswordSuccess('')
      }, 2000)

    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleClosePanel = () => {
    setShowUserPanel(false)
    setPanelView('menu')
    setShowPasswordDropdown(false)
    setFormData({ email: '', password: '', name: '' })
    setAuthError('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordSuccess('')
    setIsSignup(false)
  }

  const getPanelTitle = () => {
    if (panelView === 'login') return isSignup ? 'Créer un compte' : 'Se connecter'
    return 'Mon compte'
  }

  // Handler pour la croix de recherche - appelle onResetFilters
  const handleClearSearch = () => {
    if (onResetFilters) {
      onResetFilters()
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo à gauche */}
        <div className="header-left">
          <h1 
            onClick={onLogoClick}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            title="Retour à la carte globale"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
            </svg>
            KapaLunch
          </h1>
        </div>

        {/* Barre de recherche au centre avec boutons Filtres et + */}
        <div className="header-center">
          <div className="search-bar-header">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher un restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-header"
            />
            
            {/* Bouton croix pour effacer */}
            {searchTerm && (
              <button 
                className="btn-clear-search"
                onClick={handleClearSearch}
                title="Effacer la recherche"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
            
            {/* Bouton Filtres */}
            <button 
              className="btn-filter-header"
              onClick={() => setShowFilters(!showFilters)}
              title="Filtres avancés"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
              </svg>
            </button>

            {/* Bouton + */}
            {canAddRestaurant && (
              <button className="btn-add-header" onClick={onToggleAddForm} title="Ajouter un établissement">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Menu utilisateur à droite */}
        <div className="header-right">
          <button 
            className="user-menu-trigger"
            onClick={() => {
              setShowUserPanel(!showUserPanel)
              if (!showUserPanel && !user) {
                setPanelView('login')
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>{user ? user.name : 'Connexion'}</span>
          </button>
        </div>
      </div>

      {/* Panneau latéral */}
      {showUserPanel && (
        <div className="user-panel" ref={userPanelRef}>
          <div className="user-panel-header">
            <h3>{getPanelTitle()}</h3>
            <button className="user-panel-close" onClick={handleClosePanel}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div className="user-panel-content">
            {/* VUE LOGIN/SIGNUP */}
            {panelView === 'login' && (
              <div className="auth-form">
                <form onSubmit={handleAuthSubmit}>
                  {isSignup && (
                    <div className="form-group">
                      <label>Nom</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Votre nom"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mot de passe</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength="6"
                      placeholder="••••••••"
                    />
                  </div>
                  {authError && <div className="error-message">{authError}</div>}
                  <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
                    {authLoading ? 'Chargement...' : (isSignup ? 'Créer le compte' : 'Se connecter')}
                  </button>
                </form>
                <div className="toggle-auth">
                  <span>{isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}</span>
                  <button className="link-btn" onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? 'Se connecter' : 'Créer un compte'}
                  </button>
                </div>
              </div>
            )}

            {/* VUE MENU UTILISATEUR */}
            {panelView === 'menu' && user && (
              <>
                <div className="user-panel-info">
                  <div className="user-panel-avatar">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div className="user-panel-name">{user.name}</div>
                  {getRoleBadge(user.role)}
                </div>

                <div className="user-panel-actions">
                  {/* Panneau admin - ouvre maintenant le modal */}
                  {user.role === 'admin' && (
                    <button 
                      className="user-panel-action-btn"
                      onClick={() => {
                        setShowAdminModal(true)
                        setShowUserPanel(false)
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"/>
                      </svg>
                      <div className="action-btn-content">
                        <span className="action-btn-title">Gestion des utilisateurs</span>
                        <span className="action-btn-description">Valider, modifier, supprimer</span>
                      </div>
                    </button>
                  )}

                  {/* Changer mot de passe avec dropdown et classe .open */}
                  <div className="dropdown-section">
                    <button 
                      className="user-panel-action-btn"
                      onClick={() => setShowPasswordDropdown(!showPasswordDropdown)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                      <div className="action-btn-content">
                        <span className="action-btn-title">Changer le mot de passe</span>
                        <span className="action-btn-description">Modifier vos identifiants</span>
                      </div>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className={`action-btn-chevron ${showPasswordDropdown ? 'rotate-down' : ''}`}
                      >
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </button>

                    {/* Dropdown animé avec classe .open */}
                    <div className={`dropdown-content ${showPasswordDropdown ? 'open' : ''}`}>
                      <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                          <label>Mot de passe actuel</label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Nouveau mot de passe</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="form-group">
                          <label>Confirmer</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                        {passwordError && <div className="error-message">{passwordError}</div>}
                        {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
                        <button type="submit" className="btn btn-primary btn-block" disabled={passwordLoading}>
                          {passwordLoading ? 'Changement...' : 'Changer'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Déconnexion */}
                  <button 
                    className="user-panel-action-btn user-panel-action-btn-danger"
                    onClick={() => {
                      onLogout()
                      handleClosePanel()
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Admin */}
      <AdminUsersModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        currentUser={user}
      />
    </header>
  )
}

export default Header