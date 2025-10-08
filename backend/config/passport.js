import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure .env is loaded before using process.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Try local .env (../.env). Fallback to default cwd lookup.
dotenv.config({ path: path.join(__dirname, '../.env') });
import User from '../Models/Users.js';
import Organization from '../Models/Organization.js';

// Helper function to create default organization for new users
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

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return the user
          return done(null, user);
        }

        // Check if user exists with the same email (linking accounts)
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.profilePicture = profile.photos?.[0]?.value;
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        const username = profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 
                        email?.split('@')[0] || 
                        `google_user_${Date.now()}`;

        // Ensure unique username
        let uniqueUsername = username;
        let counter = 1;
        while (await User.findOne({ username: uniqueUsername })) {
          uniqueUsername = `${username}_${counter}`;
          counter++;
        }

        user = await User.create({
          username: uniqueUsername,
          email: email,
          googleId: profile.id,
          authProvider: 'google',
          profilePicture: profile.photos?.[0]?.value,
          credits: 1250
        });

        // Create default organization for new user
        await createDefaultOrganization(user);

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
