import { protect } from "../middleware/authMiddleware.js";
import { createJob, getJobsById, updateJob, deleteJob,getAllJobs } from "../controllers/jobController.js";
import {
  applyJob,
  getApplication,
  getApplicationsByRecuriter,
  updateApplicationStatus,
} from "../controllers/applicationController.js";

import express from "express";
const router = express.Router();

router.get("/recruiter/applications", protect, getApplicationsByRecuriter);
router.put("/application/status", protect, updateApplicationStatus);

router.get("/:id/applications", protect, getApplication);
router.post("/:id/apply", protect, applyJob);

router.post("/create", protect, createJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

router.get("/all",protect, getAllJobs);
router.get("/:id", getJobsById);


export default router;
