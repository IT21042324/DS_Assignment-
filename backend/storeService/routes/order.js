const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const csrfProtection = require("../middleware/csrfProtection");
const disableCache = require("../middleware/cacheControl");

// Import order controller functions
const {
  createOrder,
  getAllOrder,
  updateOrder,
  getOneOrder,
  getAllOrderPerStore,
  updateOrderStatus,
  getOrderCountForAdmin,
  getAllStoreOrders,
  getAllUserOrders,
  setReviewStatus,
} = require("../controller/orderController");

// Apply authentication middleware for all routes
router.use(requireAuth);

// Route for creating a new order (state-changing, needs CSRF protection)
router.post("/add", csrfProtection, disableCache, createOrder);

// Route for getting all orders (no CSRF protection needed for GET)
router.get("/", disableCache, getAllOrder);

// Route for updating an existing order (state-changing, needs CSRF protection)
router.patch("/update/", csrfProtection, disableCache, updateOrder);

// Route for getting a single order by ID (no CSRF protection needed for GET)
router.get("/get/:id", disableCache, getOneOrder);

// Route for getting all orders for a specific store (no CSRF protection needed for GET)
router.get("/getStoreOrder/:id", disableCache, getAllOrderPerStore);

// Route for updating the status of an existing order (state-changing, needs CSRF protection)
router.patch(
  "/updateOrderStatus",
  csrfProtection,
  disableCache,
  updateOrderStatus
);

// Route for getting the total order count for admin (no CSRF protection needed for GET)
router.get("/getOrderCountForAdmin", disableCache, getOrderCountForAdmin);

// Route for getting all orders for all stores (no CSRF protection needed for GET)
router.get("/getAllStoreOrders", disableCache, getAllStoreOrders);

// Route for getting all orders for a particular user (no CSRF protection needed for GET)
router.get("/getAllStoreOrders/:id", disableCache, getAllUserOrders);

// Route to set review status after user submits a store review (state-changing, needs CSRF protection)
router.patch(
  "/setReviewStatus/:id",
  csrfProtection,
  disableCache,
  setReviewStatus
);

module.exports = router;
