import express from 'express';
import { requireAuth } from '../Middleware/auth.js';
import User from '../Models/Users.js';
import { randomUUID } from 'crypto';

const router = express.Router();
router.use(requireAuth);

// Notifications
router.get('/notifications', async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ items: user.notifications || [] });
});
router.patch('/notifications/read-all', async (req, res) => {
  const user = await User.findById(req.userId);
  user.notifications = (user.notifications || []).map((n) => ({ ...n, read: true }));
  await user.save();
  res.json({ ok: true });
});
router.post('/notifications', async (req, res) => {
  const user = await User.findById(req.userId);
  const item = { id: randomUUID(), text: req.body.text || 'New notification', read: false, createdAt: new Date() };
  user.notifications.push(item);
  await user.save();
  res.json({ item });
});

// Simple rooms/messages (in-memory)
const roomsByUser = new Map();
const messagesByRoom = new Map();

router.get('/rooms', (req, res) => {
  const rooms = roomsByUser.get(req.userId) || [];
  res.json({ rooms });
});
router.post('/rooms', (req, res) => {
  const rooms = roomsByUser.get(req.userId) || [];
  const room = { id: randomUUID(), title: req.body.title || 'New Chat' };
  rooms.push(room);
  roomsByUser.set(req.userId, rooms);
  messagesByRoom.set(room.id, []);
  res.json({ room });
});
router.get('/rooms/:id/messages', (req, res) => {
  const list = messagesByRoom.get(req.params.id) || [];
  res.json({ messages: list });
});
router.post('/rooms/:id/messages', (req, res) => {
  const list = messagesByRoom.get(req.params.id) || [];
  const msg = { id: randomUUID(), role: req.body.role || 'user', text: req.body.text, createdAt: new Date() };
  list.push(msg);
  messagesByRoom.set(req.params.id, list);
  res.json({ message: msg });
});

// Gemini proxy endpoint
router.post('/ai/gemini', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'GEMINI_API_KEY not configured' });

    const prompt = req.body.text || req.body.prompt || '';
    const model = req.body.model || 'gemini-pro';

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(500).json({ message: data.error?.message || 'Gemini request failed', error: data });
    }
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ text: aiText });
  } catch (err) {
    console.error('Gemini proxy error:', err);
    res.status(500).json({ message: 'Gemini proxy error', error: String(err) });
  }
});

export default router;
