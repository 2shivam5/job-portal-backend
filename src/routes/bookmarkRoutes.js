import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { bookmarkJob, getMyBookmarks } from '../controllers/bookmarkController.js';

const router = express.Router();

router.post("/:jobid", protect, bookmarkJob);
router.get("/mybookmarks", protect, getMyBookmarks);

export default router;