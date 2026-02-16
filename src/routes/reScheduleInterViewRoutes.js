import express from "express"
import { protect } from "../middleware/authMiddleware.js";
import { reScheduledInterView,cancelInterView } from "../controllers/reScheduleInterViewController.js";

const router= express.Router();

router.patch("/applications/:applicationId/reschedule", protect, reScheduledInterView);

router.put("/interviews/:id/cancel", protect, cancelInterView);

export default router;