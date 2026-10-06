import mongoose from 'mongoose';

const designSchema = new mongoose.Schema(
  {
    designNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    size: {
      type: String,
      default: '',
      trim: true
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    imageUrl: {
      type: String,
      required: true
    },
    imagePublicId: {
      type: String,
      default: ''
    },
    imageHash: {
      type: String,
      default: ''
    },
    imageFingerprint: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

designSchema.index({ createdAt: -1 });
designSchema.index({ rate: 1, createdAt: -1 });
designSchema.index({ rate: -1, createdAt: -1 });
designSchema.index({ size: 1 });

export default mongoose.model('Design', designSchema);
