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
import { disableCache } from "../middleware/cacheControl.js";

const router = Router();

// User login route (no auth or CSRF protection needed)
router.post("/login", validateUserLogin, disableCache, userLogin);

// User sign-up route (no auth or CSRF protection needed)
router.post("/signup", validateUserSignUp, disableCache, userSignUp);

// Apply authentication middleware to all routes below
router.use(requireAuth);

// Routes that don't change state (no CSRF protection needed)
router.get("/", disableCache, getAllUsers); // Get all users
router.get("/admin/usercount", disableCache, getUserCount); // Get user count for admin
router.get(
  "/access-token/:userName/:role",
  disableCache,
  retrieveGoogleAccessToken
);
router.get("/:id/:role", disableCache, getOneUser); // Get one user by ID and role

// Apply CSRF protection to state-changing routes
router.patch("/update", csrfProtection, disableCache, updateUser); // Update user
router.patch("/updateUserStore", csrfProtection, disableCache, updateUserStore); // Update user store
router.patch(
  "/access-token",
  csrfProtection,
  disableCache,
  setGoogleAccessToken
);
router.delete("/deleteUser/:id", csrfProtection, disableCache, deleteUser); // Delete user by ID

export default router;
