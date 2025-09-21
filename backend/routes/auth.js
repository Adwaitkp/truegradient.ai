import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/Users.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing fields' });

  // Build existence check only with provided fields to avoid matching everything
  const or = [];
  if (username) or.push({ username });
  if (email) or.push({ email });
  const exists = or.length ? await User.findOne({ $or: or }) : null;
  if (exists) return res.status(409).json({ message: 'User exists' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    const token = jwt.sign({ sub: user._id.toString(), username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, username: user.username, credits: user.credits } });
  } catch (err) {
    // Handle race condition duplicate key error
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'User exists' });
    }
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  const query = username ? { username } : { email };
  const user = await User.findOne(query);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ sub: user._id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, username: user.username, credits: user.credits } });
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    res.json({ user: { id: user._id, username: user.username, credits: user.credits } });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
