export const verifyRecruiterByAdmin = async (req,res)=>{
    try{
        const recruiterId = req.params.id;
        const recruiter = await User.findById(recruiterId);

        if(!recruiter){
            return res.status(404).json({message:"User not found"});
        }

        if(recruiter.role !== "recruiter"){
            return res.status(400).json({message:"User is not a recruiter"});
        }

        recruiter.isVerified = true;
        await recruiter.save();

        res.status(200).json({
            success:true,
            message:"Recruiter verified successfully"
        });

    }catch(err){
        res.status(500).json({message:err.message});
    }
};
