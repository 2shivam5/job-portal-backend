import authUserRoutes from "./routes/authUserRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRouts.js";
import applicationRoutes from "./routes/ApplicationRoutes.js"
import express from "express";
import profileViewRoutes from "./routes/profileViewRoutes.js"
import reScheduleInterViewRoutes from "./routes/reScheduleInterViewRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js"
import filterRoutes from "./routes/filterRoutes.js"


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/Jobs", jobRoutes);
app.use("/api/User", authUserRoutes);
app.use("/api/Admin", adminRoutes);
app.use("/api/Upload", uploadRoutes);
app.use("/api/application",applicationRoutes);
app.use("/api/proView",profileViewRoutes);
app.use("/api/reschedule",reScheduleInterViewRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/job",filterRoutes)


export default app;