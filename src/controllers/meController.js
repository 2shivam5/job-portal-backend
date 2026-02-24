import jobModel from "../models/jobModel.js";
import ProfileView from "../models/profileViewModel.js";


export const getMyProfileViews = async (req, res) => {
  try {
    if (req.user?.role !== "candidate") {
      return res.status(403).json({ success: false, message: "Only candidate can view profile views" });
    }

    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const skip = (page - 1) * limit;

    const views = await ProfileView.find({ candidateId: req.user._id })
      .sort({ viewedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("recruiterId", "name email") // 
      .select("recruiterId viewedAt ip userAgent"); 

    return res.json({ success: true, page, limit, views });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
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

 
