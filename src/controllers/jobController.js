import Job from "../models/jobModel.js";
import userModel  from "../models/userModel.js";

export const createJob=async(req,res)=>{
    const{title,company,location,jobType,experienceLevel}=req.body;

    if(!title || !company || !location || !jobType || !experienceLevel){
        return res.status(400)
        .json({message:"All fields are required"});
    };
    if (req.user.role !== 'recruiter') {
        return res.status(403)
        .json({message:"Only recruiters can create jobs"});
    }
    if (!req.user.isVerifiedCandidate) {
        return res.status(403)
        .json({message:"Only verified recruiters can create jobs"});
    }
    const job=await jobModel.create({
        title,
        company,
        location,
        jobType,
        experienceLevel,
        createdBy:req.user._id
    });
    res.status(201)
    .json({
        success:true,
        message:"Job created successfully",
        job
    }); 
};
export const getJobsById=async(req,res)=>{
    const { id }=req.params;
    const job=await Job.findById(id);
    if (!job) {
        return res.status(404)
        .json({message:"Job not found"});
    }
    res.status(200)
    .json({
        success:true,
        job
    });
};
export const updateJob=async(req,res)=>{
    const job = await jobModel.findById(req.params.id);
    if (!job) {
        return res.status(404)
        .json({ success: false, message: "Job not found" });
    }
    if(job.createdBy.toString()!=req.user._id.toString()){
        return res.status(403)
        .json({ success: false, message: "Unauthorized" });
    }
    Object.assign(job, req.body);
    await job.save();

    return res.status(200).json({
        success: true,
        message: "Job updated successfully",
        job
    });
};
export const deleteJob=async(req,res)=>{
    const job=await jobModel.findById(req.params.id);
    if (!job) {
        return res.status(404)
        .json({ success: false, message: "Job not found" });
    }
    if(job.createdBy.toString()!=req.user._id.toString()){
        return res.status(403)
        .json({ success: false, message: "Unauthorized" });
    }
    await jobModel.findByIdAndDelete(req.params.id);
    res.status(200)
    .json({ success: true, message: "Job deleted successfully" });
};
    

export const getAllJobs = async (req, res) => {
  try {
    const allJobs = await Job.find().sort({ createdAt: -1 });
     console.log(req.user);

     if (req.user.role !== "candidate") {
        return res.status(400).json({
            success:false,
            message:"only candidate get all job"
        })
     }

    return res.status(200).json({
      success: true,
      count: allJobs.length,
      jobs: allJobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

