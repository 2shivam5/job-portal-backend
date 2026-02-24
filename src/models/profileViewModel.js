
import mongoose from "mongoose";
const profileViewSchema = new mongoose.Schema(
    
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

profileViewSchema.index({ candidateId: 1, recruiterId: 1 }, { unique: true });

export default mongoose.model("ProfileView", profileViewSchema);