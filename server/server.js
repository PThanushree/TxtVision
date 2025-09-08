import express from "express";
import cors from "cors";
import "dotenv/config";
import connectdb from "./config/mongodb.js";
import userRouter from "./routes/userroutes.js";
import imageRouter from "./routes/imageroutes.js";

const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; 
// Add your Vercel frontend URL in Render environment variables

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Allow only local frontend (dev) & deployed frontend (prod)
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

// ✅ Connect to database
await connectdb();

// ✅ Routes
app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

// ✅ Test route
app.get("/", (req, res) => res.send("API working"));

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
