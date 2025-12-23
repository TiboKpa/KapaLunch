import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, Shield, UserCheck, UserX, AlertTriangle } from 'lucide-react'

const AdminPanel = ({ isOpen, onClose, user }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Modal de confirmation email pour admin
  const [showEmailConfirm, setShowEmailConfirm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (isOpen && user?.role === 'admin') {
      fetchUsers()
    }
  }, [isOpen, user])

  const fetchUsers = async () => {
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
      setError('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      lurker: { label: 'En attente', color: '#fbbf24', bgColor: '#fef3c7', icon: UserX },
      user: { label: 'Utilisateur', color: '#10b981', bgColor: '#d1fae5', icon: UserCheck },
      admin: { label: 'Administrateur', color: '#8b5cf6', bgColor: '#ede9fe', icon: Shield }
    }
    const badge = badges[role] || badges.user
    const Icon = badge.icon
    
    return (
      <span 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: badge.color,
          backgroundColor: badge.bgColor,
          border: `1.5px solid ${badge.color}`,
          whiteSpace: 'nowrap'
        }}
      >
        <Icon size={14} />
        {badge.label}
      </span>
    )
  }

  const handleRoleClick = (clickedUser, newRole) => {
    // Empêcher la modification du compte admin par défaut
    if (clickedUser.email === 'admin') {
      setError('Impossible de modifier le compte admin par défaut')
      setTimeout(() => setError(''), 3000)
      return
    }

    // Empêcher l'auto-rétrogradation
    if (clickedUser.id === user.id && newRole !== 'admin') {
      setError('Vous ne pouvez pas rétrograder votre propre compte')
      setTimeout(() => setError(''), 3000)
      return
    }

    // Si déjà ce rôle, ne rien faire
    if (clickedUser.role === newRole) return

    // Si promotion vers admin, demander confirmation par email
    if (newRole === 'admin' && clickedUser.role !== 'admin') {
      setSelectedUser({ ...clickedUser, newRole })
      setEmailInput('')
      setEmailError('')
      setShowEmailConfirm(true)
      return
    }

    // Pour les autres changements, confirmer simplement
    const roleNames = {
      lurker: 'En attente',
      user: 'Utilisateur',
      admin: 'Administrateur'
    }
    
    if (confirm(`Changer le rôle de ${clickedUser.name} en "${roleNames[newRole]}" ?`)) {
      changeUserRole(clickedUser.id, newRole)
    }
  }

  const handleEmailConfirmSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')

    if (emailInput.toLowerCase() !== selectedUser.email.toLowerCase()) {
      setEmailError('L\'email ne correspond pas')
      return
    }

    await changeUserRole(selectedUser.id, selectedUser.newRole, emailInput)
    setShowEmailConfirm(false)
    setSelectedUser(null)
    setEmailInput('')
  }

  const changeUserRole = async (userId, newRole, emailConfirmation = null) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/role`,
        { newRole, emailConfirmation },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess(response.data.message)
      setTimeout(() => setSuccess(''), 4000)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de rôle')
      setTimeout(() => setError(''), 4000)
    }
  }

  const handleDelete = async (deleteUser) => {
    if (deleteUser.email === 'admin') {
      setError('Impossible de supprimer le compte admin par défaut')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (deleteUser.id === user.id) {
      setError('Vous ne pouvez pas supprimer votre propre compte')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (!confirm(`Supprimer définitivement l'utilisateur ${deleteUser.name} ?\n\nCette action est irréversible.`)) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://localhost:5000/api/users/${deleteUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess(`${deleteUser.name} a été supprimé`)
      setTimeout(() => setSuccess(''), 3000)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (!isOpen || user?.role !== 'admin') return null

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content admin-panel-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-panel-header">
            <h2>
              <Users size={24} style={{ marginRight: '0.5rem' }} />
              Gestion des utilisateurs
            </h2>
            <p className="admin-panel-subtitle">Cliquez sur un rôle pour le modifier</p>
          </div>

          {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!loading && users.length === 0 && (
            <p className="empty-message">ℹ️ Aucun utilisateur trouvé</p>
          )}

          {users.length > 0 && (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Date d'inscription</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={u.id === user.id ? 'current-user' : ''}>
                      <td>
                        <strong>{u.name}</strong>
                        {u.id === user.id && <span className="you-badge">Vous</span>}
                      </td>
                      <td className="email-cell">{u.email}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div className="role-badges">
                          <button
                            className={`role-badge-btn ${u.role === 'lurker' ? 'active' : ''}`}
                            onClick={() => handleRoleClick(u, 'lurker')}
                            disabled={u.email === 'admin' || u.id === user.id}
                            title="En attente"
                          >
                            <UserX size={14} />
                          </button>
                          <button
                            className={`role-badge-btn ${u.role === 'user' ? 'active' : ''}`}
                            onClick={() => handleRoleClick(u, 'user')}
                            disabled={u.email === 'admin' || (u.id === user.id && u.role === 'admin')}
                            title="Utilisateur"
                          >
                            <UserCheck size={14} />
                          </button>
                          <button
                            className={`role-badge-btn ${u.role === 'admin' ? 'active' : ''}`}
                            onClick={() => handleRoleClick(u, 'admin')}
                            disabled={u.email === 'admin'}
                            title="Administrateur"
                          >
                            <Shield size={14} />
                          </button>
                        </div>
                        {getRoleBadge(u.role)}
                      </td>
                      <td>
                        {u.email !== 'admin' && u.id !== user.id && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="btn-delete-user"
                            title="Supprimer l'utilisateur"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="modal-buttons">
            <button onClick={onClose} className="btn-secondary">
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation email pour promotion admin */}
      {showEmailConfirm && (
        <div className="modal-overlay" style={{ zIndex: 2002 }} onClick={() => setShowEmailConfirm(false)}>
          <div className="modal-content email-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="email-confirm-header">
              <AlertTriangle size={48} color="#f59e0b" />
              <h3>Confirmation de promotion administrateur</h3>
              <p>
                Vous êtes sur le point de promouvoir <strong>{selectedUser?.name}</strong> en tant qu'administrateur.
              </p>
            </div>

            <form onSubmit={handleEmailConfirmSubmit} className="email-confirm-form">
              <div className="form-group">
                <label>
                  Pour confirmer, veuillez saisir l'adresse email de cet utilisateur :
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value)
                    setEmailError('')
                  }}
                  placeholder="Saisissez l'email pour confirmer"
                  className={emailError ? 'input-error' : ''}
                  autoFocus
                  required
                />
                {emailError && <span className="error-text">{emailError}</span>}
              </div>

              <div className="hint-box">
                <p>💡 <strong>Indice :</strong> L'email commence par "{selectedUser?.email.substring(0, 3)}..."</p>
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setShowEmailConfirm(false)} className="btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Confirmer la promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminPanel