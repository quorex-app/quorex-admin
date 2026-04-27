const express = require('express');
const prisma = require('../db/prisma');
const { authMiddleware, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const phases = await prisma.scalePhase.findMany({
      orderBy: { phase_number: 'asc' },
      include: {
        actions: { orderBy: { position: 'asc' } },
        blockers: { orderBy: { position: 'asc' } },
      },
    });
    res.json(phases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/phases/:id', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  const { title, subtitle, period, mrr_target, kpi_label, kpi_description, badge_color } = req.body;
  try {
    const data = {};
    if (title !== undefined) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (period !== undefined) data.period = period;
    if (mrr_target !== undefined) data.mrr_target = mrr_target;
    if (kpi_label !== undefined) data.kpi_label = kpi_label;
    if (kpi_description !== undefined) data.kpi_description = kpi_description;
    if (badge_color !== undefined) data.badge_color = badge_color;
    if (!Object.keys(data).length) return res.status(400).json({ error: 'No fields' });
    const updated = await prisma.scalePhase.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/actions/:id', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  const { week_label, title, body } = req.body;
  try {
    const data = {};
    if (week_label !== undefined) data.week_label = week_label;
    if (title !== undefined) data.title = title;
    if (body !== undefined) data.body = body;
    if (!Object.keys(data).length) return res.status(400).json({ error: 'No fields' });
    const updated = await prisma.scaleAction.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/blockers/:id', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  const { title, description, fix_text, severity } = req.body;
  try {
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (fix_text !== undefined) data.fix_text = fix_text;
    if (severity !== undefined) data.severity = severity;
    if (!Object.keys(data).length) return res.status(400).json({ error: 'No fields' });
    const updated = await prisma.scaleBlocker.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
