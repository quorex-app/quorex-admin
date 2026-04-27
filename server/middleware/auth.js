const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, email, name, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function requireSuperadmin(req, res, next) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

module.exports = { authMiddleware, requireSuperadmin };
