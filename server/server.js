import express from "express";
import cors from "cors";
import "dotenv/config";
import connectdb from "./config/mongodb.js";
import userRouter from "./routes/userroutes.js";
import imageRouter from "./routes/imageroutes.js";

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

await connectdb();

app.use('/api/user', userRouter) 
app.use('/api/image', imageRouter) 

app.get("/", (req, res) => res.send("API working"));

app.listen(PORT, () => console.log("Server running on " + PORT));
