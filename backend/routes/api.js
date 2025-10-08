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
  const apiKey = process.env.GEMINI_API_KEY;
  const userInput = (req.body.text || req.body.prompt || '').toString();
  const requestedModel = (req.body.model || '').toString();
  const envDefaultModel = (process.env.GEMINI_MODEL || '').toString();

  // If no meaningful input, reply politely
  if (!userInput.trim()) {
    return res.json({ text: 'Please enter a message so I can respond.' });
  }

  // If no API key, still respond with a graceful fallback (do not 500)
  if (!apiKey) {
    return res.json({ text: `AI is not fully configured yet, but here’s a quick reply: ${userInput}` });
  }

  // Try a sequence of models and API versions until one works
  const modelCandidates = Array.from(new Set([
    requestedModel,
    envDefaultModel,
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.0-pro-latest',
    'gemini-1.0-pro'
  ].filter(Boolean)));
  const apiVersions = ['v1', 'v1beta'];

  const callGemini = async (version, model) => {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: userInput }] }] })
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, data };
  };

  for (const version of apiVersions) {
    for (const model of modelCandidates) {
      try {
        const { ok, data } = await callGemini(version, model);
        if (ok) {
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (aiText) return res.json({ text: aiText });
        } else {
          const msg = data?.error?.message || '';
          const versionMismatch = /not found for API version|not supported for generateContent/i.test(msg);
          // If version mismatch, outer loop will try the other version; otherwise continue to next model
        }
      } catch (e) {
        // Continue trying other combinations
      }
    }
  }

  // Final graceful fallback so the user always gets a response
  return res.json({ text: `I couldn’t reach the AI service right now, but I’m here. You said: ${userInput}` });
});

export default router;
