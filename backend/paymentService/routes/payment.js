const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const csrfProtection = require("../middleware/csrfProtection");
const disableCache = require("../middleware/cacheControl");

const {
  createPayment,
  getAllPayment,
  deletePayment,
  updatePayment,
  getTotalPaymentPerStore,
  getTotalPaymentForAdmin,
} = require("../controller/paymentController");

// Apply authentication to all routes
router.use(requireAuth);

// Disable cache for all routes
router.use(disableCache);

// Create a new payment (state-changing, requires CSRF protection)
router.post("/add", csrfProtection, createPayment);

// Get all payments (read-only, no CSRF protection needed)
router.get("/", getAllPayment);

// Delete a payment (state-changing, requires CSRF protection)
router.delete("/delete/", csrfProtection, deletePayment);

// Get the total payments made to a specific store (read-only, no CSRF protection needed)
router.get("/getStoreTotal/:id", getTotalPaymentPerStore);

// Update the payment status (state-changing, requires CSRF protection)
router.patch("/updatePaymentStatus", csrfProtection, updatePayment);

// Get the total payments for the admin (read-only, no CSRF protection needed)
router.get("/getAdminTotal", getTotalPaymentForAdmin);

module.exports = router;
