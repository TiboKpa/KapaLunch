// Middleware pour vérifier si l'utilisateur est admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé - Droits administrateur requis'
    })
  }

  next()
}

// Middleware pour vérifier si l'utilisateur peut ajouter des restaurants (user ou admin)
export const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    })
  }

  if (req.user.role === 'lurker') {
    return res.status(403).json({
      success: false,
      message: 'Votre compte doit être validé par un administrateur pour accéder à cette fonctionnalité'
    })
  }

  next()
}