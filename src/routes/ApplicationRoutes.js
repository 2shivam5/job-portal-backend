import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { scheduleInterview} from "../controllers/applicationController.js";

const router = express.Router();

//router.post("/applications/:id/schedule-interview",protect("recruiter"),scheduleInterview);
router.post("/applications/:id/schedule-interview", protect, scheduleInterview);

export default router;
