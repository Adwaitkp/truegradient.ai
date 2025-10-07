// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import organizationRoutes from './routes/organizations.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env relative to this file, regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true, credentials: true }));
app.use(express.json());

// Session configuration for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Test route
app.get('/', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api', organizationRoutes);

// Port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(' Connected to MongoDB');
    app.listen(PORT, () => console.log(` Server started on port ${PORT}`));
  })
  .catch((err) => console.error(' MongoDB connection error:', err));
