import jobModel from "../models/jobModel.js";
import ProfileView from "../models/profileViewModel.js";

export const getMyProfileViews = async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;

    const views = await ProfileView.find({ candidateId: req.user._id })
      .sort({ viewedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("recruiterId", "name email")
      .populate("jobId", "title company")
      .select("recruiterId jobId applicationId viewedAt ip userAgent");

    return res.json({ success: true, page, limit, views });
};

export const getMyProfileViewsCount = async (req, res) => {
    const days = Math.min(parseInt(req.query.days || "30", 10), 365);
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const count = await ProfileView.countDocuments({
      candidateId: req.user._id,
      viewedAt: { $gte: from },
    });

    return res.json({ success: true, days, count });
  };

 
