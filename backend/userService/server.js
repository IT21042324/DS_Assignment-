import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import https from "https";
import mongoose from "mongoose";
import userRouter from "./routes/user.js";
import helmet from "helmet";

// Load environment variables
dotenv.config();

const { PORT, URI } = process.env;

// Create an Express app
const app = express();
app.use(cookieParser()); // Add this line to parse cookies
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from localhost domains
      if (origin === undefined || origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

app.use(helmet()); // Use helmet to set security headers // Use helmet to set security headers

// SSL certificate options
const sslOptions = {
  key: fs.readFileSync("../certificate/localhost-key.pem"),
  cert: fs.readFileSync("../certificate/fullcert.pem"), // Full chain certificate
  ca: fs.readFileSync("../certificate/rootCA.pem"),
};

// MongoDB connection and https server setup
mongoose
  .connect(URI, { useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`Secure server running at https://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error(err.message));

// Route setup
// app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
