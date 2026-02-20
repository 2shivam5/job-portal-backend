import express from "express"
import { getAllJob } from "../controllers/filterController.js"

const router = express.Router();

router.get("/",getAllJob);


export default router;