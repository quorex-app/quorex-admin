const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [templates] = await pool.query(
      'SELECT * FROM email_templates ORDER BY email_number ASC'
    );
    const [rules] = await pool.query(
      'SELECT * FROM cold_email_rules ORDER BY type, position ASC'
    );
    res.json({ templates, rules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireSuperadmin, async (req, res) => {
  const { body, subject, name } = req.body;
  try {
    const fields = [];
    const values = [];
    if (body !== undefined) { fields.push('body = ?'); values.push(body); }
    if (subject !== undefined) { fields.push('subject = ?'); values.push(subject); }
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (!fields.length) return res.status(400).json({ error: 'No fields' });
    values.push(req.params.id);
    await pool.query(`UPDATE email_templates SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM email_templates WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/rules/:id', requireSuperadmin, async (req, res) => {
  const { content } = req.body;
  try {
    await pool.query('UPDATE cold_email_rules SET content = ? WHERE id = ?', [content, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM cold_email_rules WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
