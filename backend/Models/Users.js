import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String }, // Made optional for OAuth users
    credits: { type: Number, default: 1250 },
    // OAuth fields
    authProvider: { 
      type: String, 
      enum: ['local', 'google'], 
      default: 'local' 
    },
    googleId: { 
      type: String, 
      unique: true, 
      sparse: true // Only exists for Google users
    },
    profilePicture: { type: String }, // Store profile image URL
    // Organization reference
    defaultOrganization: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Organization' 
    },
    notifications: [
      { 
        id: String, 
        text: String, 
        read: { type: Boolean, default: false }, 
        createdAt: { type: Date, default: Date.now } 
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
