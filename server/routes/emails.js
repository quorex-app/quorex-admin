const express = require('express');
const prisma = require('../db/prisma');
const { authMiddleware, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { email_number: 'asc' },
    });
    const rules = await prisma.coldEmailRule.findMany({
      orderBy: [{ type: 'asc' }, { position: 'asc' }],
    });
    res.json({ templates, rules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  const { body, subject, name } = req.body;
  try {
    const data = {};
    if (body !== undefined) data.body = body;
    if (subject !== undefined) data.subject = subject;
    if (name !== undefined) data.name = name;
    if (!Object.keys(data).length) return res.status(400).json({ error: 'No fields' });
    const updated = await prisma.emailTemplate.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/rules/:id', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  const { content } = req.body;
  try {
    const updated = await prisma.coldEmailRule.update({
      where: { id },
      data: { content },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
