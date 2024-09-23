// routes/userRoutes.js
import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getOneUser,
  getUserCount,
  retrieveGoogleAccessToken,
  setGoogleAccessToken,
  updateUser,
  updateUserStore,
  userLogin,
  userSignUp,
} from "../controller/userController.js";
import { csrfProtection } from "../middleware/csrfProtetion.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  validateUserLogin,
  validateUserSignUp,
} from "../validation/validation.js";

const router = Router();

// User login route (no auth or CSRF protection needed)
router.post("/login", validateUserLogin, userLogin);

// User sign-up route (no auth or CSRF protection needed)
router.post("/signup", validateUserSignUp, userSignUp);

// Apply authentication middleware to all routes below
router.use(requireAuth);

// Routes that don't change state (no CSRF protection needed)
router.get("/", getAllUsers); // Get all users
router.get("/admin/usercount", getUserCount); // Get user count for admin
router.get("/access-token/:userName/:role", retrieveGoogleAccessToken);
router.get("/:id/:role", getOneUser); // Get one user by ID and role

// Apply CSRF protection to state-changing routes
router.patch("/update", csrfProtection, updateUser); // Update user
router.patch("/updateUserStore", csrfProtection, updateUserStore); // Update user store
router.patch("/access-token", csrfProtection, setGoogleAccessToken);
router.delete("/deleteUser/:id", csrfProtection, deleteUser); // Delete user by ID

export default router;
