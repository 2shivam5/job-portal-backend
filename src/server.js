import dotenv from "dotenv";
dotenv.config();

import "./events/listners/emailListners.js";

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 8080;

await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
