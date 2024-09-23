const https = require("https"); // Import the https module
const fs = require("fs"); // Import the File System module
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser"); // Add this line
const helmet = require("helmet"); // Import helmet for security headers

// Creating an Express.js app
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
// Use helmet to set security headers
app.use(helmet()); // This will include the 'X-Content-Type-Options: nosniff' header

const PORT = process.env.PORT; // Get port number from environment variables
const URI = process.env.URI; // Get MongoDB URI from environment variables
const options = {
  key: fs.readFileSync("../certificate/localhost-key.pem"), // Path to the private key file
  cert: fs.readFileSync("../certificate/localhost.pem"), // Path to the certificate file
};

// Connecting to the MongoDB database and starting the https server
mongoose
  .connect(URI, { useUnifiedTopology: true })
  .then(() => {
    console.log("Connection to MongoDB successful");

    // Creating https server with SSL certificate
    https.createServer(options, app).listen(PORT, () => {
      console.log(`Secure server is running on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

// Importing route modules
const paymentRouter = require("./routes/payment");
// Adding a route for handling payment-related requests
app.use("/api/payment", paymentRouter);
