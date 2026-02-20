

import mongoose from "mongoose";
import Application from "../models/applicationModels.js";
import Notification from "../models/notificationModel.js";
import eventBus from "../events/eventBus.js";

const oid = (id) => mongoose.Types.ObjectId.isValid(id);

const upsertNotif = (userId, appId, type, title, message) =>
  Notification.findOneAndUpdate(
    { user: userId, entityType: "APPLICATION", entityId: appId, key: "INTERVIEW" },
    {
      $set: { type, title, message, link: `/applications/${appId}`, isRead: false },
      $setOnInsert: { entityType: "APPLICATION", entityId: appId, key: "INTERVIEW" },
    },
    { upsert: true, new: true, runValidators: true }
  );

export const reScheduledInterView = async (req, res) => {
  try {
    if (req.user?.role !== "recruiter")
      return res.status(403).json({ 
    success: false,
     message: "Only recruiter can reschedule"
     });

    const { applicationId } = req.params;
    const { scheduleAt, mode, meetingLink, location, note } = req.body || {};
    if (!oid(applicationId)) return res.status(400).json({ 
      success: false,
       message: "Invalid applicationId"
       });
    if (!scheduleAt) return res.status(400).json({
       success: false, 
       message: "scheduleAt is required"
       });

    const dt = new Date(scheduleAt);
    if (isNaN(dt.getTime())) return res.status(400).json({
       success: false,
        message: "Invalid scheduleAt date"
       });

    const app = await Application.findById(applicationId)
      .populate("userId", "email name")
      .populate("jobId", "title company");
    if (!app) return res.status(404).json({ 
      success: false,
       message: "Application not found"
       });

    if (!app.interView) {
      if (!mode) return res.status(400).json({ 
        success: false, 
        message: "mode is required (first schedule)"
       });
      app.interView = {
        scheduleAt: dt,
        mode,
        meetingLink,
        location,
        note,
        scheduleBy: req.user._id,
        status: "scheduled",
        history: [
          {
            action: "SCHEDULED",
            oldValue: {},
            newValue: { scheduleAt: dt, mode, meetingLink, location, note, status: "scheduled" },
            changedBy: req.user._id,
          },
        ],
      };
    } else {
      const iv = app.interView;
      iv.history = iv.history || [];
      iv.history.push({
        action: "RESCHEDULED",
        oldValue: { scheduleAt: iv.scheduleAt, mode: iv.mode, meetingLink: iv.meetingLink, location: iv.location, note: iv.note, status: iv.status },
        newValue: { scheduleAt: dt, mode: mode || iv.mode, meetingLink, location, note, status: "rescheduled" },
        changedBy: req.user._id,
      });
      iv.scheduleAt = dt;
      iv.status = "rescheduled";
      if (mode) iv.mode = mode;
      if (meetingLink !== undefined) iv.meetingLink = meetingLink;
      if (location !== undefined) iv.location = location;
      if (note !== undefined) iv.note = note;
    }

    app.status = "interView";
    app.statusHistory.push({ status: "interView", changedBy: req.user._id, note: "interView rescheduled" });
    app.lastStatusChangedAt = new Date();
    await app.save();

    const candidateId = app.userId?._id || app.userId;

    await upsertNotif(
      candidateId,
      app._id,
      "INTERVIEW_RESCHEDULED",
      "Interview Rescheduled",
      `Your interview for "${app.jobId?.title || "this job"}" has been rescheduled to ${app.interView.scheduleAt}.`
    );

    if (app.userId?.email) {
      eventBus.emit("SendMail", {
        to: app.userId.email,
        subject: `Interview rescheduled: ${app.jobId?.title || ""}`,
        text: `Hi ${app.userId?.name || ""},\n\nNew Time: ${app.interView.scheduleAt}\nMode: ${app.interView.mode}\nMeeting Link: ${app.interView.meetingLink || "NA"}\nLocation: ${app.interView.location || "NA"}\nNote: ${app.interView.note || "NA"}\n\n- Job Portal`,
      });
    }

    return res.json({ success: true, message: "interView rescheduled", interView: app.interView.toObject() });
  } catch (e) {
    console.error("reScheduledInterView ERROR:", e);
    return res.status(500).json({
       success: false, 
       message: "Server error"
   });
  }
};

export const cancelInterView = async (req, res) => {
  try {
    if (req.user?.role !== "recruiter")
      return res.status(403).json({ success: false, message: "Only recruiter can cancel" });

    const applicationId = req.params.applicationId || req.params.id;
    const { reason = "" } = req.body || {};
    if (!oid(applicationId)) return res.status(400).json({ success: false, message: "Invalid applicationId" });

    const app = await Application.findById(applicationId)
      .populate("userId", "email name")
      .populate("jobId", "title company");
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    if (!app.interView) return res.status(404).json({ success: false, message: "interView not found in this application" });

    const iv = app.interView;
    if (iv.status === "cancelled") return res.json({ success: true, message: "interView already cancelled", interView: iv });

    iv.history = iv.history || [];
    iv.history.push({
      action: "CANCELLED",
      oldValue: { status: iv.status },
      newValue: { status: "cancelled", reason },
      changedBy: req.user._id,
    });

    iv.status = "cancelled";
    iv.cancleReason = reason || null; 

    app.status = "interView";
    app.statusHistory.push({ status: "interView", changedBy: req.user._id, note: `interView cancelled${reason ? `: ${reason}` : ""}` });
    app.lastStatusChangedAt = new Date();
    await app.save();

    const candidateId = app.userId?._id || app.userId;

    await upsertNotif(
      candidateId,
      app._id,
      "INTERVIEW_CANCELLED",
      "Interview Cancelled",
      `Your interview for "${app.jobId?.title || "this job"}" has been cancelled.${reason ? ` Reason: ${reason}` : ""}`
    );

    if (app.userId?.email) {
      eventBus.emit("SendMail", {
        to: app.userId.email,
        subject: `Interview cancelled: ${app.jobId?.title || ""}`,
        text: `Hi ${app.userId?.name || ""},\n\nYour interview for ${app.jobId?.title || "the job"} has been cancelled.${reason ? `\nReason: ${reason}` : ""}\n\n- Job Portal`,
      });
    }

    return res.json({ success: true, message: "interView cancelled", interView: app.interView.toObject() });
  } catch (e) {
    console.error("cancelInterView ERROR:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
