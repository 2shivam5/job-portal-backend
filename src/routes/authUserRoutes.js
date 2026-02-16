import expess from "express";
import { regUser,loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = expess.Router();

router.post("/register", regUser);
router.get("/login",loginUser)
router.get("/profile", protect, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});
export default router;