const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { authMiddleware, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();

// Public: get invitation details
router.get('/invite/:token', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, u.name AS invited_by_name FROM invitations i
       JOIN users u ON u.id = i.invited_by
       WHERE i.token = ? AND i.accepted_at IS NULL AND i.expires_at > NOW()`,
      [req.params.token]
    );
    if (!rows.length) return res.status(404).json({ error: 'Invitation not found or expired' });
    const inv = rows[0];
    res.json({ email: inv.email, role: inv.role, invited_by: inv.invited_by_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: accept invitation
router.post('/invite/:token/accept', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Name and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  try {
    const [rows] = await pool.query(
      `SELECT * FROM invitations WHERE token = ? AND accepted_at IS NULL AND expires_at > NOW()`,
      [req.params.token]
    );
    if (!rows.length) return res.status(404).json({ error: 'Invitation not found or expired' });
    const inv = rows[0];

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [inv.email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [inv.email, passwordHash, name, inv.role]
    );
    await pool.query(
      'UPDATE invitations SET accepted_at = NOW() WHERE id = ?',
      [inv.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected routes
router.use(authMiddleware);

router.get('/', requireSuperadmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, name, role, is_active, last_login, created_at FROM users ORDER BY created_at ASC'
    );
    const [invitations] = await pool.query(
      `SELECT i.*, u.name AS invited_by_name FROM invitations i
       JOIN users u ON u.id = i.invited_by
       ORDER BY i.created_at DESC`
    );
    res.json({ users, invitations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/invite', requireSuperadmin, async (req, res) => {
  const { email, role = 'collaborator' } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  if (role !== 'collaborator') return res.status(400).json({ error: 'Can only invite collaborators' });
  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length) return res.status(409).json({ error: 'User already exists' });

    // Check for pending invitation
    const [pendingInv] = await pool.query(
      'SELECT id FROM invitations WHERE email = ? AND accepted_at IS NULL AND expires_at > NOW()',
      [email.toLowerCase().trim()]
    );
    if (pendingInv.length) return res.status(409).json({ error: 'Pending invitation already exists for this email' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [result] = await pool.query(
      'INSERT INTO invitations (email, token, role, invited_by, expires_at) VALUES (?, ?, ?, ?, ?)',
      [email.toLowerCase().trim(), token, role, req.user.id, expiresAt]
    );
    const [rows] = await pool.query(
      `SELECT i.*, u.name AS invited_by_name FROM invitations i
       JOIN users u ON u.id = i.invited_by WHERE i.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/invitations/:id', requireSuperadmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM invitations WHERE id = ? AND accepted_at IS NULL', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id/deactivate', requireSuperadmin, async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot deactivate yourself' });
  }
  try {
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id/activate', requireSuperadmin, async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
