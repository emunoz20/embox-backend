module.exports = function isAdmin(req, res, next) {
  // authMiddleware ya dejó el user aquí
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado: solo administradores'
    });
  }

  next();
};
