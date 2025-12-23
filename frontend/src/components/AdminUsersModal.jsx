import { useState, useEffect } from 'react'
import axios from 'axios'
import './AdminUsersModal.css'

function AdminUsersModal({ isOpen, onClose, currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      fetchAllUsers()
    }
  }, [isOpen])

  const fetchAllUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:5000/api/users/all',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUsers(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://localhost:5000/api/users/${userId}/role`,
        { newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess(`Rôle de ${userName} mis à jour !`)
      setTimeout(() => setSuccess(''), 3000)
      fetchAllUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de rôle')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://localhost:5000/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess(`${userName} a été supprimé`)
      setTimeout(() => setSuccess(''), 3000)
      fetchAllUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      user: 'Utilisateur',
      lurker: 'En attente'
    }
    return labels[role] || role
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: '#d4af37',
      user: '#4caf50',
      lurker: '#ff9800'
    }
    return colors[role] || '#999'
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
        )
      case 'user':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"/>
          </svg>
        )
      case 'lurker':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      default:
        return null
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300) // Durée de l'animation
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen && !isClosing) return null

  return (
    <div className={`admin-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`admin-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <h2>Panneau Admin - Gestion des utilisateurs</h2>
          </div>
          <button className="admin-modal-close" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="admin-modal-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Messages */}
        {error && <div className="admin-modal-error">{error}</div>}
        {success && <div className="admin-modal-success">{success}</div>}

        {/* Content */}
        <div className="admin-modal-content">
          {loading ? (
            <div className="admin-modal-loading">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="spinner">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
              </svg>
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>
                      <div className="th-content">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        Nom
                      </div>
                    </th>
                    <th>
                      <div className="th-content">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        Email
                      </div>
                    </th>
                    <th>
                      <div className="th-content">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"/>
                        </svg>
                        Rôle
                      </div>
                    </th>
                    <th>
                      <div className="th-content">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                        </svg>
                        Date
                      </div>
                    </th>
                    <th>
                      <div className="th-content">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                        </svg>
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <p>Aucun utilisateur trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className={user.id === currentUser?.id ? 'current-user' : ''}>
                        <td>
                          <div className="user-name-cell">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <span>{user.name}</span>
                            {user.id === currentUser?.id && (
                              <span className="you-badge">Vous</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="email-cell">
                            {user.email}
                          </div>
                        </td>
                        <td>
                          <div className="role-buttons-wrapper">
                            <button
                              className={`role-btn ${user.role === 'lurker' ? 'active' : ''}`}
                              onClick={() => user.role !== 'lurker' && handleRoleChange(user.id, 'lurker', user.name)}
                              disabled={user.id === currentUser?.id || user.role === 'lurker'}
                              title="En attente"
                              style={{ '--role-color': getRoleColor('lurker') }}
                            >
                              {getRoleIcon('lurker')}
                            </button>
                            <button
                              className={`role-btn ${user.role === 'user' ? 'active' : ''}`}
                              onClick={() => user.role !== 'user' && handleRoleChange(user.id, 'user', user.name)}
                              disabled={user.id === currentUser?.id || user.role === 'user'}
                              title="Utilisateur"
                              style={{ '--role-color': getRoleColor('user') }}
                            >
                              {getRoleIcon('user')}
                            </button>
                            <button
                              className={`role-btn ${user.role === 'admin' ? 'active' : ''}`}
                              onClick={() => user.role !== 'admin' && handleRoleChange(user.id, 'admin', user.name)}
                              disabled={user.id === currentUser?.id || user.role === 'admin'}
                              title="Admin"
                              style={{ '--role-color': getRoleColor('admin') }}
                            >
                              {getRoleIcon('admin')}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              disabled={user.id === currentUser?.id}
                              className="btn-delete"
                              title="Supprimer l'utilisateur"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="admin-modal-footer">
          <div className="admin-modal-stats">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span>{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}</span>
            <span className="separator">•</span>
            <span>{filteredUsers.filter(u => u.role === 'admin').length} admin{filteredUsers.filter(u => u.role === 'admin').length > 1 ? 's' : ''}</span>
            <span className="separator">•</span>
            <span>{filteredUsers.filter(u => u.role === 'lurker').length} en attente</span>
          </div>
          <button className="btn-close" onClick={handleClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminUsersModal