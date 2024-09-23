import https from "https";
import fetch from "node-fetch";
import fs from "fs";
import jwt from "jsonwebtoken";

// Custom HTTPS agent for SSL certificate
const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // Bypass SSL certificate verification
  ca: fs.readFileSync("../certificate/rootCA.pem"),
});

export const requireAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Authorization token not found" });
  }

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
    console.error(error);
    res.status(401).json({ error: "Unauthorized Request" });
  }
};
