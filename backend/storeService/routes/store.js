const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const csrfProtection = require("../middleware/csrfProtection"); // Assuming you have a CSRF protection middleware
const disableCache = require("../middleware/cacheControl"); // Assuming you have a cache control middleware
const rateLimit = require("express-rate-limit");

const createStoreLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 createStore requests per minute
  message: "Too many store creation requests, please try again later.",
});

// Rate limiter for updating orders
const updateStoreLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 update requests per minute
  message: "Too many update requests, please try again later.",
});

const {
  createStore,
  getAllStore,
  updateStore,
  getOneStore,
  deleteStore,
  addStoreItem,
  deleteStoreItem,
  getStoreItemCount,
  modifyStoreItem,
  addReview,
} = require("../controller/storeController");

// Apply authentication middleware to all routes
router.use(requireAuth);

// Create a new store (state-changing, requires CSRF protection)
router.post(
  "/add",
  createStoreLimiter,
  csrfProtection,
  disableCache,
  createStore
);

// Get all stores (read-only, no CSRF protection needed)
router.get("/", disableCache, getAllStore);

// Get the item count in a store (read-only, no CSRF protection needed)
router.get("/getStoreItemCount/:id", disableCache, getStoreItemCount);

// Update store info (state-changing, requires CSRF protection)
router.put(
  "/update/",
  updateStoreLimiter,
  csrfProtection,
  disableCache,
  updateStore
);

// Add a review for a store item (state-changing, requires CSRF protection)
router.patch(
  "/addReview",
  updateStoreLimiter,
  csrfProtection,
  disableCache,
  addReview
);

// Delete a store (state-changing, requires CSRF protection)
router.delete(
  "/delete/:id",
  updateStoreLimiter,
  csrfProtection,
  disableCache,
  deleteStore
);

// Get one store by ID (read-only, no CSRF protection needed)
router.get("/get/:id", disableCache, getOneStore);

// Add an item to the store item array (state-changing, requires CSRF protection)
router.patch(
  "/updateItem",
  updateStoreLimiter,
  csrfProtection,
  disableCache,
  addStoreItem
);

// Modify an item in the store item array (state-changing, requires CSRF protection)
router.patch(
  "/modifyItem",
  updateStoreLimiter,
  csrfProtection,
  disableCache,
  modifyStoreItem
);

// Delete an item from the store item array (state-changing, requires CSRF protection)
router.patch(
  "/deleteStoreItem",
  updateStoreLimiter,
  csrfProtection,
  disableCache,
  deleteStoreItem
);

module.exports = router;
