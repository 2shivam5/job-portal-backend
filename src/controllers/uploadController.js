import User from "../models/userModel.js";

export const uploadResumeFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Resume file required" });
  }

  if (req.user.role !== "candidate") {
    return res.status(403).json({ success: false, message: "Only candidates can upload resume" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { resume: req.file.path },
    { new: true }
  ).select("-password");

  return res.status(201).json({
    success: true,
    message: "Resume uploaded",
    resume: user.resume,
  });
};
