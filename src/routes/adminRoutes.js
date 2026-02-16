import { verifyRecruiterByAdmin } from "../controllers/adminController.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/verify/:id', protect, verifyRecruiterByAdmin);

export default router;