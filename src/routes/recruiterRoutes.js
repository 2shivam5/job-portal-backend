import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleWare.js";
    import {
  recruiterDashboard,
  getRecruiterJobs,
  getJobApplicationsForRecruiter,
} from "../controllers/recruiterController.js";

const router=express.Router();
router.use(protect,requireRole("recruiter"));

router.get("/dashboard", recruiterDashboard);
router.get("/jobs", getRecruiterJobs);
router.get("/jobs/:jobId/applications", getJobApplicationsForRecruiter);

export default router;