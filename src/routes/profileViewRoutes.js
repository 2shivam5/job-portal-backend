import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { profileViewByRecruiter } from "../controllers/profileViewController.js";
import { getMyProfileViews, getMyProfileViewsCount } from "../controllers/meController.js";

const router = express.Router();

router.post("/candidates/:candidateId/view", protect, profileViewByRecruiter);
router.get("/me/profile-views", protect, getMyProfileViews);
router.get("/me/profile-views/count", protect, getMyProfileViewsCount);

export default router;

