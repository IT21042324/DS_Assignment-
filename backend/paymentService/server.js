const https = require("https");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const permissionsPolicy = require("permissions-policy"); // Import permissions-policy middleware

// Creating an Express.js app
const app = express();

app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// CORS configuration to allow requests from localhost during development
app.use(
  cors({
    origin: function (origin, callback) {
      if (origin === undefined || origin.includes("localhost")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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

// Create HTTPS options with SSL certificate
const PORT = process.env.PORT;
const URI = process.env.URI;
const options = {
  key: fs.readFileSync("../certificate/localhost-key.pem"),
  cert: fs.readFileSync("../certificate/localhost.pem"),
};

// Connecting to the MongoDB database and starting the https server
mongoose
  .connect(URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log("Connection to MongoDB successful");

    https.createServer(options, app).listen(PORT, () => {
      console.log(`Secure server is running on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

// Importing route modules
const paymentRouter = require("./routes/payment");
app.use("/api/payment", paymentRouter);

// CSP Violation Reporting Endpoint
app.post("/csp-violation-report-endpoint", (req, res) => {
  console.log("CSP Violation: ", req.body);
  res.status(204).end();
});
