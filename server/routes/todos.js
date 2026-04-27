const express = require('express');
const prisma = require('../db/prisma');
const { authMiddleware, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const todos = await prisma.todoItem.findMany({
      orderBy: [{ phase: 'asc' }, { position: 'asc' }],
    });
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  const { is_done, title, note, tag, phase, position } = req.body;

  // Collaborator can only toggle is_done
  if (req.user.role === 'collaborator') {
    if (title !== undefined || note !== undefined || tag !== undefined || phase !== undefined || position !== undefined) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  try {
    const data = {};
    if (is_done !== undefined) data.is_done = Boolean(is_done);
    if (req.user.role === 'superadmin') {
      if (title !== undefined) data.title = title;
      if (note !== undefined) data.note = note;
      if (tag !== undefined) data.tag = tag;
      if (phase !== undefined) data.phase = phase;
      if (position !== undefined) data.position = position;
    }

    if (!Object.keys(data).length) return res.status(400).json({ error: 'No fields to update' });

    const updated = await prisma.todoItem.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireSuperadmin, async (req, res) => {
  const { title, note, phase, tag } = req.body;
  if (!title || !phase) return res.status(400).json({ error: 'Title and phase required' });
  try {
    const maxPositionResult = await prisma.todoItem.aggregate({
      where: { phase },
      _max: { position: true },
    });
    const position = (maxPositionResult._max.position ?? 0) + 1;
    const todo = await prisma.todoItem.create({
      data: { title, note: note || null, phase, tag: tag || null, is_done: false, position },
    });
    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    await prisma.todoItem.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
