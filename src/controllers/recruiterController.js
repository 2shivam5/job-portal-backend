
import mongoose from "mongoose";
import Job from "../models/jobModel.js";
import Application from "../models/applicationModels.js";

const oid=id=>mongoose.Types.ObjectId.isValid(id);

const JOB_RECRUITER_FIELD = "createdBy";

export const recruiterDashboard=async(req,res)=>{
    console.log("AUTH USER IN CONTROLLER:", req.user);
console.log("AUTH USER ID:", req.user?._id?.toString());

    try {
        const recruiterId=req.user._id;

        const jobs=await Job.find({[JOB_RECRUITER_FIELD]:recruiterId}).select("_id");
        const jobIds = jobs.map((j) => j._id);

        if (jobIds.length===0) {
             return res.json({
        success: true,
        jobs: 0,
        applications: 0,
        byStatus: {},
       });
      }
      const byStatusAgg=await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
     const byStatus = {};
    let totalApps = 0;
    for (const row of byStatusAgg) {
      byStatus[row._id] = row.count;
      totalApps += row.count;
    }

    return res.json({
      success: true,
      jobs: jobIds.length,
      applications: totalApps,
      byStatus,
    });

    } catch (error) {
     console.error("recruiterDashboard ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
    }
};
export const getRecruiterJobs=async(req,res)=>{
    try {
        const recruiterId=req.user._id;
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
        const skip = (page - 1) * limit;

        const filter={[JOB_RECRUITER_FIELD]:recruiterId};

        const [total,data]=await Promise.all([
        Job.countDocuments(filter),
        Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);
    return res.json({
        success:true,
        total,
        page,
        limit,
        data
    });

    } catch (error) {
    console.error("getRecruiterJobs ERROR:", e);
    return res.status(500).json({ success: false, message: "Server error" });   
    }
};
// export const getJobApplicationsForRecruiter=async(req,res)=>{
//     try {
//         const recruiterId=req.user._id;
//         const { jobId }=req.params;
//         if (!oid(jobId)) {
//             return res.status(401).json({
//                 success:false,
//                 message:"invalid jobId"
//             })
//         };
//         const Job=await Job.findOne({_id:jobId,[JOB_RECRUITER_FIELD]:recruiterId}).select("_id title company");
//         if (!Job) return res.status(403).json({ 
//             success: false, 
//             message: "Not allowed (job not yours)" 
//         });
//        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
//     const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
//     const skip = (page - 1) * limit;

//     const status = req.query.status;
//     const filter = { jobId };
//     if (status) filter.status = status;

//     const [total, data] = await Promise.all([
//       Application.countDocuments(filter),
//       Application.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .populate("userId", "name email")
//         .select("userId status createdAt lastStatusChangedAt"),
//     ]);

//     return res.json({
//       success: true,
//       job: { _id: job._id, title: job.title, company: job.company },
//       total,
//       page,
//       limit,
//       data,
//     });
//   } catch (e) {
//     console.error("getJobApplicationsForRecruiter ERROR:", e);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

export const getJobApplicationsForRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { jobId } = req.params;

    if (!oid(jobId)) {
      return res.status(400).json({ success: false, message: "invalid jobId" });
    }

    const job = await Job.findOne({
      _id: jobId,
      [JOB_RECRUITER_FIELD]: recruiterId,
    }).select("_id title company");
2
    if (!job) {
      return res.status(403).json({
        success: false,
        message: "Not allowed (job not yours)",
      });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const skip = (page - 1) * limit;

    const status = req.query.status;
    const filter = { jobId };
    if (status) filter.status = status;

    const [total, data] = await Promise.all([
      Application.countDocuments(filter),
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .select("userId status createdAt lastStatusChangedAt"),
    ]);

    return res.json({
      success: true,
      job: { _id: job._id, title: job.title, company: job.company },
      total,
      page,
      limit,
      data,
    });
  } catch (e) {
    console.error("getJobApplicationsForRecruiter ERROR:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



