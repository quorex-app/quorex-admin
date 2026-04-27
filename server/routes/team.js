const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../db/prisma');
const { authMiddleware, requireSuperadmin } = require('../middleware/auth');

const router = express.Router();

// Helper: format invitation row with invited_by_name (matches existing API shape)
function formatInvitation({ invitedBy, ...inv }) {
  return { ...inv, invited_by_name: invitedBy?.name ?? null };
}

// Public: get invitation details
router.get('/invite/:token', async (req, res) => {
  try {
    const inv = await prisma.invitation.findUnique({
      where: { token: req.params.token },
      include: { invitedBy: { select: { name: true } } },
    });
    if (!inv || inv.accepted_at !== null || !inv.expires_at || inv.expires_at < new Date()) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }
    res.json({ email: inv.email, role: inv.role, invited_by: inv.invitedBy.name });
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
    const inv = await prisma.invitation.findUnique({
      where: { token: req.params.token },
    });
    if (!inv || inv.accepted_at !== null || !inv.expires_at || inv.expires_at < new Date()) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }

    const existing = await prisma.user.findUnique({ where: { email: inv.email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { email: inv.email, password_hash, name, role: inv.role },
    });
    await prisma.invitation.update({
      where: { id: inv.id },
      data: { accepted_at: new Date() },
    });
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
    const [users, invitationsRaw] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, is_active: true, last_login: true, created_at: true },
        orderBy: { created_at: 'asc' },
      }),
      prisma.invitation.findMany({
        include: { invitedBy: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
      }),
    ]);
    const invitations = invitationsRaw.map(formatInvitation);
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
  const normalizedEmail = email.toLowerCase().trim();
  if (normalizedEmail === req.user.email) {
    return res.status(400).json({ error: 'Cannot invite yourself' });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const pendingInv = await prisma.invitation.findFirst({
      where: { email: normalizedEmail, accepted_at: null, expires_at: { gt: new Date() } },
    });
    if (pendingInv) return res.status(409).json({ error: 'Pending invitation already exists for this email' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: { email: normalizedEmail, token, role, invited_by: req.user.id, expires_at: expiresAt },
      include: { invitedBy: { select: { name: true } } },
    });
    res.status(201).json(formatInvitation(invitation));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/invitations/:id', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    const inv = await prisma.invitation.findFirst({ where: { id, accepted_at: null } });
    if (!inv) return res.status(404).json({ error: 'Invitation not found or already accepted' });
    await prisma.invitation.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id/deactivate', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Cannot deactivate yourself' });
  }
  try {
    await prisma.user.update({ where: { id }, data: { is_active: false } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id/activate', requireSuperadmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
  try {
    await prisma.user.update({ where: { id }, data: { is_active: true } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
