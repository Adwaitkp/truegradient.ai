import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    members: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      }
    ],
    isDefault: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Index for efficient queries
organizationSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model('Organization', organizationSchema);
