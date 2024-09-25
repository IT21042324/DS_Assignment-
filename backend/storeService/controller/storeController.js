// Importing Store model and validator for sanitization
let Store = require("../models/Store");
let logger = require("../logger");
let validator = require("validator");
let mongoose = require("mongoose");

// Creating a new store in the database
const createStore = async (req, res) => {
  const { storeName, location, merchantID } = req.body;

  // Sanitize input data
  const sanitizedStoreName = validator.escape(storeName);
  const sanitizedLocation = validator.escape(location);
  const sanitizedMerchantID = validator.escape(merchantID);

  // Creating a new Store object with the sanitized data
  const newStore = new Store({
    storeName: sanitizedStoreName,
    merchantID: sanitizedMerchantID,
    location: sanitizedLocation,
  });

  // Saving the new store to the database
  await newStore
    .save()
    .then(() => {
      logger.info(`Store created successfully: ${newStore}`);
      res.json(newStore);
    })
    .catch((err) => {
      logger.error(`Error creating store: ${err.message}`);
      res.send(err.message);
    });
};

// Getting all stores from the database
const getAllStore = async (req, res) => {
  await Store.find()
    .then((store) => {
      logger.info("All stores retrieved successfully.");
      res.json(store);
    })
    .catch((err) => {
      logger.error(`Error retrieving stores: ${err.message}`);
      res.send(err.message);
    });
};

// Updating basic store info details
const updateStore = async (req, res) => {
  const { storeName, location, storeID } = req.body;

  // Sanitize input data
  const sanitizedStoreName = validator.escape(storeName);
  const sanitizedLocation = validator.escape(location);

  if (!mongoose.Types.ObjectId.isValid(storeID)) {
    logger.error(`Invalid store ID: ${storeID}`);
    return res.status(400).json({ error: "Invalid store ID" });
  }

  try {
    const store = await Store.findById(storeID);
    if (!store) {
      logger.error(`Store not found: ${storeID}`);
      return res.status(404).json({ error: "Store not found" });
    }

    store.storeName = sanitizedStoreName;
    store.location = sanitizedLocation;

    const updatedStore = await store.save();
    logger.info(`Store updated successfully: ${updatedStore}`);
    res.json(updatedStore);
  } catch (err) {
    logger.error(`Error updating store: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Deleting a store from the database
const deleteStore = async (req, res) => {
  try {
    const data = await Store.findByIdAndDelete(req.params.id);
    logger.info(`Store deleted successfully: ${data}`);
    res.json(data);
  } catch (err) {
    logger.error(`Error deleting store: ${err.message}`);
    res.send(err.message);
  }
};

// Getting a store by ID
const getOneStore = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Store.findById(id).select("-storeItem.image");
    logger.info(`Store retrieved by ID: ${data._storeName}`);
    res.json(data);
  } catch (err) {
    logger.error(`Error retrieving store by ID: ${err.message}`);
    res.send(err.message);
  }
};

// Getting the description of a store by ID
const getStoreDescription = async (req, res) => {
  try {
    const data = await Store.findById(req.params.id, { description });
    logger.info(`Store description retrieved successfully: ${data}`);
    res.json(data);
  } catch (err) {
    logger.error(`Error retrieving store description: ${err.message}`);
    res.send(err.message);
  }
};

// Get the item count from the store
const getStoreItemCount = async (req, res) => {
  const storeID = req.params.id;

  try {
    const data = await Store.findOne({ _id: storeID }).select(
      "-storeItem.itemImage"
    );

    logger.info(
      `Store item count retrieved successfully: ${data.storeItem.length}`
    );
    res.json({ itemCount: data.storeItem.length });
  } catch (err) {
    logger.error(`Error retrieving store item count: ${err.message}`);
    res.send(err.message);
  }
};

// Add items to store
const addStoreItem = async (req, res) => {
  const { item, storeID } = req.body;

  if (!mongoose.Types.ObjectId.isValid(storeID)) {
    logger.error(`Invalid store ID: ${storeID}`);
    return res.status(400).json({ error: "Invalid store ID" });
  }

  try {
    const store = await Store.findById(storeID);
    if (!store) {
      logger.error(`Store not found: ${storeID}`);
      return res.status(404).json({ error: "Store not found" });
    }

    console.log("store", store);

    store.storeItem.push(item);
    const updatedStore = await store.save();

    logger.info(`Item added to store successfully: ${updatedStore}`);
    res.json(updatedStore);
  } catch (err) {
    logger.error(`Error adding item to store: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Modify the items in the store
const modifyStoreItem = async (req, res) => {
  const { item, storeID } = req.body;

  if (!mongoose.Types.ObjectId.isValid(storeID)) {
    logger.error(`Invalid store ID: ${storeID}`);
    return res.status(400).json({ error: "Invalid store ID" });
  }

  if (!item || !item._id) {
    logger.error("Invalid or missing item ID");
    return res.status(400).json({ error: "Invalid or missing item ID" });
  }

  try {
    const store = await Store.findById(storeID);
    if (!store) {
      logger.error(`Store not found: ${storeID}`);
      return res.status(404).json({ error: "Store not found" });
    }

    const itemIndex = store.storeItem.findIndex(
      (itm) => itm._id.toString() === item._id
    );
    if (itemIndex === -1) {
      logger.error(`Item not found in store: ${item._id}`);
      return res.status(404).json({ error: "Item not found in store" });
    }

    // Directly update the item in the storeItem array without .toObject()
    store.storeItem[itemIndex] = {
      ...store.storeItem[itemIndex], // Preserve existing properties
      ...item, // Overwrite with new item data
    };

    // Save the updated store
    const updatedStore = await store.save();

    logger.info(`Store item modified successfully: ${updatedStore}`);
    res.json(updatedStore);
  } catch (err) {
    logger.error(`Error modifying store item: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Delete item from store
const deleteStoreItem = async (req, res) => {
  const { storeID, itemID } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(storeID) ||
    !mongoose.Types.ObjectId.isValid(itemID)
  ) {
    logger.error(`Invalid store ID or item ID: ${storeID}, ${itemID}`);
    return res.status(400).json({ error: "Invalid store ID or item ID" });
  }

  try {
    const store = await Store.findById(storeID);
    if (!store) {
      logger.error(`Store not found: ${storeID}`);
      return res.status(404).json({ error: "Store not found" });
    }

    store.storeItem = store.storeItem.filter(
      (itm) => itm._id.toString() !== itemID
    );
    const updatedStore = await store.save();

    logger.info(`Item deleted from store successfully: ${updatedStore}`);
    res.json(updatedStore);
  } catch (err) {
    logger.error(`Error deleting item from store: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Add store review
const addReview = async (req, res) => {
  const { review, storeID, userID, userName, rating } = req.body;

  console.log(review, storeID, userID, userName, rating);

  // Sanitize user input
  const sanitizedReview = validator.escape(review);
  const sanitizedUserName = validator.escape(userName);

  if (!mongoose.Types.ObjectId.isValid(storeID)) {
    logger.error(`Invalid store ID: ${storeID}`);
    return res.status(400).json({ error: "Invalid store ID" });
  }

  try {
    const store = await Store.findById(storeID);
    if (!store) {
      logger.error(`Store not found: ${storeID}`);
      return res.status(404).json({ error: "Store not found" });
    }

    store.reviews.push({
      userID,
      userName: sanitizedUserName,
      rating,
      review: sanitizedReview,
    });
    const updatedStore = await store.save();

    logger.info(`Review added successfully: ${updatedStore}`);
    res.json(updatedStore);
  } catch (err) {
    logger.error(`Error adding review: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// Exporting necessary functions to be used in the route file
module.exports = {
  createStore,
  getAllStore,
  updateStore,
  addReview,
  deleteStore,
  getOneStore,
  getStoreDescription,
  addStoreItem,
  modifyStoreItem,
  deleteStoreItem,
  getStoreItemCount,
};
