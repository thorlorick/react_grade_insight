// backend/src/middleware/authMiddleware.js
function requireTeacher(req, res, next) {
  if (!req.session?.teacher_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = { requireTeacher };

