const https = require("https");
const fetch = require("node-fetch");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // Bypass the SSL certificate verification
  ca: fs.readFileSync("../certificate/rootCA.pem"),
});

const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).json({ error: "Authorization token not found" });

  try {
    const { id, role } = jwt.verify(token, process.env.SECRET);

    // Use fetch with the custom HTTPS agent
    const response = await fetch(
      `https://localhost:8080/api/user/${id}/${role}`,
      { agent: httpsAgent }
    );

    const data = await response.json();

    req.user = data;

    next();
  } catch (error) {
    console.log("error Here");
    console.log(error);
    res.status(401).json({ error: "Token expired or invalid" });
  }
};

module.exports = requireAuth;
