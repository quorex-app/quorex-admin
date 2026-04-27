const express = require('express');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [[todoStats]] = await pool.query(
      'SELECT COUNT(*) AS total, SUM(is_done) AS done FROM todo_items'
    );
    const [[emailCount]] = await pool.query(
      'SELECT COUNT(*) AS total FROM email_templates'
    );
    const [[teamCount]] = await pool.query(
      'SELECT COUNT(*) AS total FROM users WHERE is_active = 1'
    );
    res.json({
      todos: {
        total: todoStats.total,
        done: todoStats.done || 0,
        percent: todoStats.total > 0
          ? Math.round((todoStats.done / todoStats.total) * 100)
          : 0,
      },
      emails: emailCount.total,
      team: teamCount.total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
