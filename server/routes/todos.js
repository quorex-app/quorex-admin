const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM todo_items ORDER BY phase, position ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { is_done, title, note, tag, phase, position } = req.body;

  // Collaborator can only toggle is_done
  if (req.user.role === 'collaborator') {
    if (is_done === undefined || title !== undefined || note !== undefined) {
      // Only allow is_done for collaborators
      if (title !== undefined || note !== undefined || tag !== undefined || phase !== undefined || position !== undefined) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
  }

  try {
    const fields = [];
    const values = [];

    if (is_done !== undefined) { fields.push('is_done = ?'); values.push(is_done ? 1 : 0); }
    if (req.user.role === 'superadmin') {
      if (title !== undefined) { fields.push('title = ?'); values.push(title); }
      if (note !== undefined) { fields.push('note = ?'); values.push(note); }
      if (tag !== undefined) { fields.push('tag = ?'); values.push(tag); }
      if (phase !== undefined) { fields.push('phase = ?'); values.push(phase); }
      if (position !== undefined) { fields.push('position = ?'); values.push(position); }
    }

    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

    values.push(id);
    await pool.query(`UPDATE todo_items SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM todo_items WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireSuperadmin, async (req, res) => {
  const { title, note, phase, tag } = req.body;
  if (!title || !phase) return res.status(400).json({ error: 'Title and phase required' });
  try {
    const [maxPos] = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM todo_items WHERE phase = ?',
      [phase]
    );
    const position = maxPos[0].next_pos;
    const [result] = await pool.query(
      'INSERT INTO todo_items (title, note, phase, tag, is_done, position) VALUES (?, ?, ?, ?, 0, ?)',
      [title, note || null, phase, tag || null, position]
    );
    const [rows] = await pool.query('SELECT * FROM todo_items WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireSuperadmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM todo_items WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
