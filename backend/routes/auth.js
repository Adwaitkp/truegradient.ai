import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/Users.js';
import Organization from '../Models/Organization.js';
import passport from '../config/passport.js';

const router = express.Router();

// Helper function to create default organization
async function createDefaultOrganization(user) {
  try {
    const defaultOrg = await Organization.create({
      name: `${user.username}'s Organization`,
      owner: user._id,
      members: [user._id],
      isDefault: true
    });

    user.defaultOrganization = defaultOrg._id;
    await user.save();

    return defaultOrg;
  } catch (error) {
    console.error('Error creating default organization:', error);
    throw error;
  }
}

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
    const user = await User.create({ 
      username, 
      email, 
      passwordHash,
      authProvider: 'local'
    });

    // Create default organization
    const defaultOrg = await createDefaultOrganization(user);

    const token = jwt.sign({ sub: user._id.toString(), username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    return res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        credits: user.credits,
        defaultOrganization: defaultOrg._id
      },
      organization: {
        id: defaultOrg._id,
        name: defaultOrg.name,
        isDefault: defaultOrg.isDefault
      }
    });
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
  const user = await User.findOne(query).populate('defaultOrganization');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Check if user is OAuth user
  if (user.authProvider !== 'local') {
    return res.status(401).json({ message: 'Please use Google Sign-In for this account' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ sub: user._id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ 
    token, 
    user: { 
      id: user._id, 
      username: user.username, 
      email: user.email,
      credits: user.credits,
      defaultOrganization: user.defaultOrganization?._id
    },
    organization: user.defaultOrganization ? {
      id: user.defaultOrganization._id,
      name: user.defaultOrganization.name,
      isDefault: user.defaultOrganization.isDefault
    } : null
  });
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).populate('defaultOrganization');
    res.json({ 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        credits: user.credits,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        defaultOrganization: user.defaultOrganization?._id
      },
      organization: user.defaultOrganization ? {
        id: user.defaultOrganization._id,
        name: user.defaultOrganization.name,
        isDefault: user.defaultOrganization.isDefault
      } : null
    });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/signin' }),
  async (req, res) => {
    try {
      console.log('Google OAuth callback - User:', req.user);
      
      if (!req.user) {
        throw new Error('No user returned from Google OAuth');
      }

      // Generate JWT token
      const token = jwt.sign(
        { sub: req.user._id.toString(), username: req.user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('JWT token generated, redirecting to frontend');

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/signin?error=auth_failed`);
    }
  }
);

export default router;
