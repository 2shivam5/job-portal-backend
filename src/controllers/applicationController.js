import mongoose from "mongoose";
import Job from "../models/jobModel.js";
import Application from "../models/applicationModels.js";
import User from "../models/userModel.js";
import eventBus from "../events/eventBus.js";
import { sendMail } from "../utils/sendMail.js";
import notificationModel from "../models/notificationModel.js";
import { assertRecruiterOwnsApplication } from "../utils/assertRecruiterOwnsApplication.js";

export const applyJob = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        success: false,
        message: "Only candidates can apply for jobs",
      });
    }

    const jobId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const me = await User.findById(req.user._id).select("resume email role");

    if (!me?.resume) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume first, then apply",
      });
    }

    const jobDoc = await Job.findById(jobId);

    if (!jobDoc) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (jobDoc.createdBy.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot apply for your own job",
      });
    }

    const alreadyApplied = await Application.findOne({
      jobId: jobId,
      userId: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const application = await Application.create({
      jobId: jobId,
      jobTitle: jobDoc.title,
      company: jobDoc.company,
      location: jobDoc.location,
      userId: req.user._id,
      resumeUrl: me.resume,
      status: "applied",
    });

    console.log(application);

    return res.status(201).json({
      success: true,
      message: "Job application successful",
      application,
      appliedBy: {
        userId: req.user._id,
        email: me.email,
        role: me.role,
      },
    });
  } catch (error) {
    console.error("APPLY JOB ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getApplication = async (req, res) => {
  const applications = await Application.find({ userId: req.user._id }).populate(
    "jobId",
    "title company location jobType experienceLevel"
  );

  return res.status(200).json({
    success: true,
    applications,
  });
};

export const getApplicationsByRecuriter = async (req, res) => {
  console.log(" HIT recruiter/applications", req.originalUrl);
  console.log("REQ USER:", req.user?._id?.toString(), "ROLE:", req.user?.role);

  if (req.user.role !== "recruiter") {
    return res.status(403).json({
      success: false,
      message: "Only recruiters can view applications",
    });
  }

  const jobs = await Job.find({ createdBy: req.user._id }).select(
    "_id title company"
  );

  console.log("JOBS FOUND:", jobs.length);

  const jobIds = jobs.map((j) => j._id);

  if (jobIds.length === 0) {
    return res.status(200).json({
      success: true,
      totalApplications: 0,
      applications: [],
    });
  }

  const applications = await Application.find({ jobId: { $in: jobIds } })
    .populate("userId", "name email resume")
    .sort({ createdAt: -1 });

  console.log("APPLICATIONS FOUND:", applications.length);

  return res.status(200).json({
    success: true,
    totalApplications: applications.length,
    applications,
  });
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status, note } = req.body;

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can update application status",
      });
    }

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "applicationId is required",
      });
    }

    const allowedStatus = ["applied", "shortlisted", "rejected", "hired"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const application = await Application.findById(applicationId).populate(
      "userId",
      "email name"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const job = await Job.findById(application.jobId).select(
      "createdBy title company"
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this application",
      });
    }

    if (["rejected", "hired"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update. Application is already ${application.status}`,
      });
    }

    if (application.status === status) {
      return res.status(400).json({
        success: false,
        message: `Application already ${status}`,
      });
    }

    application.status = status;
    await application.save();

    const to = application.userId?.email;

    if (to) {
      const candidateName = application.userId?.name || "Candidate";
      const jobTitle = application.jobTitle || job.title || "Job";
      const company = application.company || job.company || "";

      const subject =
        status === "shortlisted"
          ? `Shortlisted: ${jobTitle}`
          : status === "rejected"
          ? `Application Update: ${jobTitle}`
          : status === "hired"
          ? `Congratulations! Selected for ${jobTitle}`
          : `Application Update: ${jobTitle}`;

      const text = `Hi ${candidateName},

        Your application for ${jobTitle}${company ? " at " + company : ""} is now: ${status.toUpperCase()}.
        ${note ? "\nNote: " + note : ""}

          Thanks,
            Job Portal Team`;

      console.log(" EMITTING SendMail:", to, status);

      eventBus.emit("SendMail", { to, subject, text });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (err) {
    console.error("UPDATE_APPLICATION_STATUS_ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const isValidUrl = (s) => {
  try { new URL(s); return true; } catch { return false; }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { dateTime, mode, meetingLink, location, note } = req.body || {};

    if (!dateTime || !mode) {
      return res.status(400).json({ success: false, message: "dateTime and mode are required" });
    }

    if (!["online", "offline"].includes(mode)) {
      return res.status(400).json({ success: false, message: "mode must be online or offline" });
    }

    const scheduledAt = new Date(dateTime);
    if (Number.isNaN(scheduledAt.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid dateTime" });
    }

    if (scheduledAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "Interview time must be in the future" });
    }

    if (mode === "online") {
      if (!meetingLink || !isValidUrl(meetingLink)) {
        return res.status(400).json({
          success: false,
          message: "Valid meetingLink required for online interview",
        });
      }
    }

    if (mode === "offline") {
      if (!location || location.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "location required for offline interview",
        });
      }
    }

    const appDoc = await Application.findById(req.params.id)
      .populate("jobId", "title createdBy company")
      .populate("userId", "email name");

    if (!appDoc) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    await assertRecruiterOwnsApplication(appDoc, req.user._id);

    const now = new Date();
    const hasActiveInterview =
      appDoc.interview?.scheduleAt && new Date(appDoc.interview.scheduleAt) > now && appDoc.interview.status !== "cancelled";

    if (hasActiveInterview) {
      const interview = appDoc.interview;

      const oldValue = {
        scheduleAt: interview.scheduleAt,
        mode: interview.mode,
        meetingLink: interview.meetingLink,
        location: interview.location,
        note: interview.note,
        status: interview.status,
      };

      interview.scheduleAt = scheduledAt;
      interview.mode = mode;
      interview.meetingLink = mode === "online" ? meetingLink : null;
      interview.location = mode === "offline" ? location : null;
      interview.note = note;
      interview.scheduleBy = req.user._id;
      interview.status = "rescheduled";

      interview.history = interview.history || [];
      interview.history.push({
        action: "RESCHEDULED",
        oldValue,
        newValue: {
          scheduleAt: interview.scheduleAt,
          mode: interview.mode,
          meetingLink: interview.meetingLink,
          location: interview.location,
          note: interview.note,
          status: interview.status,
        },
        changedBy: req.user._id,
      });

      appDoc.lastStatusChangedAt = new Date();
      await appDoc.save();

      const jobTitle = appDoc.jobId?.title || appDoc.jobTitle || "Job";

      await notificationModel.create({
        user: appDoc.userId._id,
        type: "INTERVIEW_SCHEDULED",
        title: "Interview Updated",
        message: `Your interview for "${jobTitle}" has been updated to ${scheduledAt.toLocaleString()}.`,
        link: `/applications/${appDoc._id}`,
        isRead: false,
      });

      const candidateEmail = appDoc.userId?.email;
      if (candidateEmail) {
        const details =
          mode === "online"
            ? `Mode: Online\nMeeting Link: ${meetingLink}\nTime: ${scheduledAt.toLocaleString()}`
            : `Mode: Offline\nLocation: ${location}\nTime: ${scheduledAt.toLocaleString()}`;

        eventBus.emit("SendMail", {
          to: candidateEmail,
          subject: `Interview Updated: ${jobTitle}`,
          text: `Hi ${appDoc.userId?.name || "Candidate"}\n\n${details}\n\nNote: ${note || "-"}\n\nThanks\nJob Portal Team`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Interview updated (rescheduled)",
        application: appDoc,
      });
    }

    appDoc.interview = {
      scheduleAt: scheduledAt,
      mode,
      meetingLink: mode === "online" ? meetingLink : null,
      location: mode === "offline" ? location : null,
      note,
      scheduleBy: req.user._id,
      status: "scheduled",
      history: [
        {
          action: "SCHEDULED",
          oldValue: {},
          newValue: {
            scheduleAt: scheduledAt,
            mode,
            meetingLink: mode === "online" ? meetingLink : null,
            location: mode === "offline" ? location : null,
            note,
            status: "scheduled",
          },
          changedBy: req.user._id,
        },
      ],
    };

    appDoc.status = "interView";
    appDoc.lastStatusChangedAt = new Date();
    appDoc.statusHistory.push({
      status: "interView",
      changedBy: req.user._id,
      note: note || "Interview scheduled",
    });

    await appDoc.save();

    const jobTitle = appDoc.jobId?.title || appDoc.jobTitle || "Job";

    await notificationModel.create({
      user: appDoc.userId._id,
      type: "INTERVIEW_SCHEDULED",
      title: "Interview Scheduled",
      message: `Your interview is scheduled for "${jobTitle}" on ${scheduledAt.toLocaleString()}.`,
      link: `/applications/${appDoc._id}`,
      isRead: false,
    });

    const candidateEmail = appDoc.userId?.email;
    if (candidateEmail) {
      const details =
        mode === "online"
          ? `Mode: Online\nMeeting Link: ${meetingLink}\nTime: ${scheduledAt.toLocaleString()}`
          : `Mode: Offline\nLocation: ${location}\nTime: ${scheduledAt.toLocaleString()}`;

      eventBus.emit("SendMail", {
        to: candidateEmail,
        subject: `Interview Scheduled: ${jobTitle}`,
        text: `Hi ${appDoc.userId?.name || "Candidate"}\n\n${details}\n\nNote: ${note || "-"}\n\nThanks\nJob Portal Team`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview scheduled successfully",
      application: appDoc,
    });
  } catch (err) {
    console.error("SCHEDULE_INTERVIEW_ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
