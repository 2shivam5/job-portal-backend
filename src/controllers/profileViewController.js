import ProfileView from "../models/profileViewModel.js";

export const profileViewByRecruiter = async (req, res) => {
console.log("HIT:", req.method, req.originalUrl);
console.log("PARAMS:", req.params);


    const recruiterId = req.user._id;
    const { candidateId, 
        //jobId, applicationId
     } = req.params;

    // const doc = await ProfileView.create({
    //   candidateId,
    //   recruiterId,
    //   //jobId: jobId,
    //   //applicationId: applicationId,
    //   ip: req.ip,
    //   userAgent: req.get("user-agent"),
    //   viewedAt: new Date(),
    // });

    const doc = await ProfileView.create({
  candidateId,
  recruiterId,
  ip: req.ip,
  userAgent: req.get("user-agent"),
  viewedAt: new Date(),
});

    res.status(201).json({
      success: true,
      message: "Profile view tracked",
      data: doc,
    });

};
