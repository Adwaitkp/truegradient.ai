import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    credits: { type: Number, default: 1250 },
    notifications: [
      { id: String, text: String, read: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now } }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
