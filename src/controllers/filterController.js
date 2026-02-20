import Job from "../models/jobModel.js";

export const getAllJob = async (req, res) => {
  try {
    const {
      keyword,
      location,
      type,
      experience,
      sort = "latest", 
      page = "1",
      limit = "10",
    } = req.query;

    const query = {};

    if (keyword?.trim()) {
      const k = keyword.trim();
      query.$or = [
        { title: { $regex: k, $options: "i" } },
        { company: { $regex: k, $options: "i" } },
      ];
    }

    if (location?.trim()) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    if (type) query.jobType = type;

    if (experience) query.experienceLevel = experience;

    let sortBy = { createdAt: -1, _id: -1 }; 
    if (sort === "oldest") sortBy = { createdAt: 1, _id: 1 };
    if (sort === "title_asc") sortBy = { title: 1, _id: -1 };
    if (sort === "title_desc") sortBy = { title: -1, _id: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("createdBy", "name email")
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum),

      Job.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: jobs.length,
      sort,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};