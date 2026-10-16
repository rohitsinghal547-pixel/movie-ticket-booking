function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      message: "Please log in to continue."
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied. Admin privileges required."
    });
  }

  next();
}

module.exports = adminMiddleware;