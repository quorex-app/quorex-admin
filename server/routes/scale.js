const express = require('express');
const pool = require('../db/pool');
const { authMiddleware, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [phases] = await pool.query('SELECT * FROM scale_phases ORDER BY phase_number ASC');
    const [actions] = await pool.query('SELECT * FROM scale_actions ORDER BY phase_id, position ASC');
    const [blockers] = await pool.query('SELECT * FROM scale_blockers ORDER BY phase_id, position ASC');

    const result = phases.map(phase => ({
      ...phase,
      actions: actions.filter(a => a.phase_id === phase.id),
      blockers: blockers.filter(b => b.phase_id === phase.id),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/phases/:id', requireSuperadmin, async (req, res) => {
  const { title, subtitle, period, mrr_target, kpi_label, kpi_description, badge_color } = req.body;
  try {
    const fields = [];
    const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (subtitle !== undefined) { fields.push('subtitle = ?'); values.push(subtitle); }
    if (period !== undefined) { fields.push('period = ?'); values.push(period); }
    if (mrr_target !== undefined) { fields.push('mrr_target = ?'); values.push(mrr_target); }
    if (kpi_label !== undefined) { fields.push('kpi_label = ?'); values.push(kpi_label); }
    if (kpi_description !== undefined) { fields.push('kpi_description = ?'); values.push(kpi_description); }
    if (badge_color !== undefined) { fields.push('badge_color = ?'); values.push(badge_color); }
    if (!fields.length) return res.status(400).json({ error: 'No fields' });
    values.push(req.params.id);
    await pool.query(`UPDATE scale_phases SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM scale_phases WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/actions/:id', requireSuperadmin, async (req, res) => {
  const { week_label, title, body } = req.body;
  try {
    const fields = [];
    const values = [];
    if (week_label !== undefined) { fields.push('week_label = ?'); values.push(week_label); }
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (body !== undefined) { fields.push('body = ?'); values.push(body); }
    if (!fields.length) return res.status(400).json({ error: 'No fields' });
    values.push(req.params.id);
    await pool.query(`UPDATE scale_actions SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM scale_actions WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/blockers/:id', requireSuperadmin, async (req, res) => {
  const { title, description, fix_text, severity } = req.body;
  try {
    const fields = [];
    const values = [];
    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (fix_text !== undefined) { fields.push('fix_text = ?'); values.push(fix_text); }
    if (severity !== undefined) { fields.push('severity = ?'); values.push(severity); }
    if (!fields.length) return res.status(400).json({ error: 'No fields' });
    values.push(req.params.id);
    await pool.query(`UPDATE scale_blockers SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM scale_blockers WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
