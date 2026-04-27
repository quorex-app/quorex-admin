const express = require('express');
const prisma = require('../db/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [totalTodos, doneTodos, totalEmails, activeUsers] = await Promise.all([
      prisma.todoItem.count(),
      prisma.todoItem.count({ where: { is_done: true } }),
      prisma.emailTemplate.count(),
      prisma.user.count({ where: { is_active: true } }),
    ]);
    res.json({
      todos: {
        total: totalTodos,
        done: doneTodos,
        percent: totalTodos > 0 ? Math.round((doneTodos / totalTodos) * 100) : 0,
      },
      emails: totalEmails,
      team: activeUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
