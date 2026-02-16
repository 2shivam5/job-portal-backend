import express from "express";
import { upload } from "../middleware/multer.js";
import { uploadResumeFile } from "../controllers/uploadController.js";
import { protect ,mustBeVerified} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/resume",protect, upload.single("resume"), uploadResumeFile);

export default router;