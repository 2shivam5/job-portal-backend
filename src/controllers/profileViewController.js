import mongoose from "mongoose";
import User from "../models/userModel.js";
import ProfileView from "../models/profileViewModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const profileViewByRecruiter = async(req,res)=>{
  if (req.user?.role !== "recruiter") {
    return res.status(403).json({
      success:false,
      message:"only recruiter"
    });
  }
  const {candidateId}=req.params;
  if (!isValidId(candidateId)) {
    return res.status(403).json({
      success:false,
      message:"only valid candidate Id"
    });
  }
 const candidate = await User.findOne({ _id: candidateId, role: "candidate" })
  .select("name email resume skills experience location profilePic");

  if (!candidate) {
    return res.status(403).json({
      success:false,
      message:"candidate not found!!!"
  });
}
const profileView = await ProfileView.findOneAndUpdate(
      { candidateId, recruiterId: req.user._id },
      {
        $set: {
          viewedAt: new Date(),
          ip: req.ip || null,
          userAgent: req.get("user-agent") || null,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, candidate, profileView });
 }