import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import https from "https";
import mongoose from "mongoose";
import userRouter from "./routes/user.js";
import helmet from "helmet";
import permissionsPolicy from "permissions-policy";

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

app.disable("x-powered-by");

// Security headers using Helmet with a comprehensive set of protections
app.use(
  helmet({
    frameguard: { action: "SAMEORIGIN" }, // Protect against clickjacking
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://trusted-scripts.com",
          "https://www.paypal.com",
          "https://accounts.google.com",
        ],
        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "'sha256-<hashed-style-content>'",
        ],
        frameSrc: [
          "'self'",
          "https://www.paypal.com",
          "https://cardinalcommerce.com",
        ],
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "https://www.sandbox.paypal.com",
          "https://www.googleapis.com",
          "https://people.googleapis.com",
        ],
        frameAncestors: ["'self'"],
        reportTo: "/csp-violation-report-endpoint",
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    noSniff: true,
    ieNoOpen: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    xssFilter: true,
    dnsPrefetchControl: { allow: false },
    permittedCrossDomainPolicies: { policy: "none" },
    expectCt: {
      maxAge: 86400,
      enforce: true,
    },
  })
);

// Permissions Policy middleware to restrict certain browser features
app.use(
  permissionsPolicy({
    features: {
      geolocation: ["self"],
      camera: ["none"],
      microphone: ["none"],
      fullscreen: ["self"],
    },
  })
);

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
