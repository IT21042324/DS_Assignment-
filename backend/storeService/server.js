// Import necessary packages
const https = require("https"); // Import the https module
const fs = require("fs"); // Import the File System module
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file
const cookieParser = require("cookie-parser"); // Add this line

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

const PORT = process.env.PORT; // Get port number from environment variables
const URI = process.env.URI; // Get MongoDB URI from environment variables
// Reading SSL certificate and private key generated by mkcert
const options = {
  key: fs.readFileSync("../certificate/localhost-key.pem"), // Private key
  cert: fs.readFileSync("../certificate/fullcert.pem"), // Public certificate
  // Optionally add the certificate authority (CA) chain if necessary
  ca: fs.readFileSync("../certificate/rootCA.pem"), // CA file if needed (mkcert root CA)
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

const storeRouter = require("./routes/store");
const orderRouter = require("./routes/order");

// Set up routes for handling requests to /api/store and /api/order endpoints
app.use("/api/store", storeRouter);
app.use("/api/order", orderRouter);
