// middleware/authMiddleware.js

function requireRole(role) {
  return function (req, res, next) {
    // If no user or wrong role → block
    if (!req.session?.user || req.session.user.role !== role) {
      return res.status(403).send("You're not supposed to be here.");
    }
    // Otherwise → let them through
    next();
  };
}

module.exports = { requireRole };
