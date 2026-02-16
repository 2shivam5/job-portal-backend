import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    entityType: { type: String, default: "APPLICATION" },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    key: { type: String, default: null }, 

    type: {
      type: String,
      enum: [
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_RESCHEDULED",
        "INTERVIEW_UPDATED",
        "INTERVIEW_CANCELLED",
        "STATUS_CHANGED",
        "JOB_APPLIED",
        "PROFILE_VIEWED",
      ],
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index(
  { user: 1, entityType: 1, entityId: 1, key: 1 },
  {
    unique: true,
    partialFilterExpression: {
      entityId: { $type: "objectId" },
      key: { $type: "string" },
      entityType: { $type: "string" },
    },
  }
);

export default mongoose.model("Notification", notificationSchema);
