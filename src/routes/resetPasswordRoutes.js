import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendResetPasswordOtp, verifyResetOtp,resetPassword } from '../controllers/resetPasswordController.js';

const router = express.Router();

router.post("/reset-password",sendResetPasswordOtp);
router.post("/verify-otp", verifyResetOtp);
router.post("/reset-password-final", resetPassword);
//router.post("/update-password", protect, updatePassword);

export default router;