import Bookmark from '../models/bookmarkModel.js';
import Job from '../models/jobModel.js';

export const bookmarkJob = async(req,res)=>{
    if (req.user.role !== "candidate") {
        return res.status(403).json({
            success:false,
            message:"Only candidates can bookmark jobs"
        })
    }
    const jobid = req.params.jobid;
    const job = await Job.findById(jobid);
    if (!job) {
        return res.status(404).json({
            success:false,
            message:"Job not found"
        })
    }
    
    const alreadyBookmarked = await Bookmark.findOne({
        user:req.user._id,
        job:jobid
    });
    if (alreadyBookmarked) {
        await alreadyBookmarked.remove();
        return res.status(200).json({
            success:true,
            message:"Job removed from bookmarks"
        })
    }
    await Bookmark.create({
        user:req.user._id,
        job:jobid
    });
    return res.status(200).json({
        success:true,
        message:"Job bookmarked successfully"
    })
};

export const getMyBookmarks = async(req,res)=>{
    const bookmarks = await Bookmark.find({user:req.user._id})
    .populate({
        path:"job",
        populate:{path:"createdBy",select:"name email"}
    })
    .sort({createdAt:-1});

    return res.status(200).json({
        success:true,
        count:bookmarks.length,
        bookmarks
    })
}