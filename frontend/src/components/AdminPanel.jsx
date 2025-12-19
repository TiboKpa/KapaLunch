import { useState, useEffect } from 'react'
import axios from 'axios'

const AdminPanel = ({ isOpen, onClose, user }) => {
  const [lurkers, setLurkers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isOpen && user?.role === 'admin') {
      fetchLurkers()
    }
  }, [isOpen, user])

  const fetchLurkers = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        'http://localhost:5000/api/users/lurkers',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setLurkers(response.data.data)
    } catch (err) {
      setError('Erreur lors du chargement des lurkers')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (userId, userName) => {
    if (!confirm(`Valider l'utilisateur ${userName} ?`)) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://localhost:5000/api/users/${userId}/validate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess(`${userName} a été validé !`)
      setTimeout(() => setSuccess(''), 3000)
      fetchLurkers()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la validation')
    }
  }

  const handleReject = async (userId, userName) => {
    if (!confirm(`Rejeter (supprimer) l'utilisateur ${userName} ?`)) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `http://localhost:5000/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess(`${userName} a été rejeté`)
      setTimeout(() => setSuccess(''), 3000)
      fetchLurkers()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du rejet')
    }
  }

  if (!isOpen || user?.role !== 'admin') return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-panel" onClick={(e) => e.stopPropagation()}>
        <h2>🛠️ Panneau administrateur</h2>

        <div className="admin-section">
          <h3>Utilisateurs en attente de validation ({lurkers.length})</h3>

          {loading && <p>Chargement...</p>}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!loading && lurkers.length === 0 && (
            <p className="empty-message">✅ Aucun utilisateur en attente</p>
          )}

          {lurkers.length > 0 && (
            <div className="lurkers-list">
              {lurkers.map((lurker) => (
                <div key={lurker.id} className="lurker-card">
                  <div className="lurker-info">
                    <strong>{lurker.name}</strong>
                    <span className="lurker-email">{lurker.email}</span>
                    <span className="lurker-date">
                      Inscrit le {new Date(lurker.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="lurker-actions">
                    <button
                      onClick={() => handleValidate(lurker.id, lurker.name)}
                      className="btn-success"
                    >
                      ✓ Valider
                    </button>
                    <button
                      onClick={() => handleReject(lurker.id, lurker.name)}
                      className="btn-danger"
                    >
                      ✗ Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button onClick={onClose} className="btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel