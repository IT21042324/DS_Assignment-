const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const csrfProtection = require("../middleware/csrfProtection");
const disableCache = require("../middleware/cacheControl");

const {
  postItem,
  addReview,
  getAllItems,
  modifyReview,
  deleteReview,
  updateItem,
  getOneItem,
  deleteItem,
  deleteAllItemsFromStore,
  getAllItemsWithPagination,
} = require("../controller/itemController");

// Route for getting all items (read-only, no CSRF protection needed)
router.get("/", disableCache, getAllItems);

// Route for getting a specific item by ID (read-only, no CSRF protection needed)
router.get("/findOne", disableCache, getOneItem);

// Route for getting items with pagination (read-only, no CSRF protection needed)
router.get("/pagination", disableCache, getAllItemsWithPagination);

// Use the authentication middleware for all routes below
router.use(requireAuth);

// Route for adding a new item (state-changing, requires CSRF protection)
router.post("/addItem", csrfProtection, disableCache, postItem);

// Route for adding a new review to an item (state-changing, requires CSRF protection)
router.patch("/addReview", csrfProtection, disableCache, addReview);

// Route for modifying an existing review for an item (state-changing, requires CSRF protection)
router.patch("/modifyReview", csrfProtection, disableCache, modifyReview);

// Route for deleting a review for an item (state-changing, requires CSRF protection)
router.patch("/deleteReview", csrfProtection, disableCache, deleteReview);

// Route for deleting an item (state-changing, requires CSRF protection)
router.delete("/deleteItem/:id", csrfProtection, disableCache, deleteItem);

// Route for updating an item (state-changing, requires CSRF protection)
router.patch("/updateItem", csrfProtection, disableCache, updateItem);

// Route for deleting all items for a specific store by store ID (state-changing, requires CSRF protection)
router.delete(
  "/deleteStoreItems/:id",
  csrfProtection,
  disableCache,
  deleteAllItemsFromStore
);

module.exports = router;
