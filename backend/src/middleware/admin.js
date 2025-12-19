export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé'
    })
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé - Droits administrateur requis'
    })
  }

  next()
}