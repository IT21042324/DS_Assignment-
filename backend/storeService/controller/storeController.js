// Importing Store model
let Store = require("../models/Store");
let logger = require("../logger");
let mongoose = require("mongoose");

// Creating a new store in the database
const createStore = async (req, res) => {
  const { storeName, location, merchantID } = req.body;

  // Creating a new Store object with the provided data
  const newStore = new Store({
    storeName,
    merchantID,
    location,
  });

  // Saving the new store to the database
  await newStore
    .save()
    .then(() => {
      logger.info(`Store created successfully: ${newStore}`);
      // Sending the newly created store object as response
      res.json(newStore);
    })
    .catch((err) => {
      // If there is an error, logging the error message and sending it as response
      logger.error(`Error creating store: ${err.message}`);
      res.send(err.message);
    });
};

// Getting all stores from the database
const getAllStore = async (req, res) => {
  await Store.find()
    .then((store) => {
      logger.info("All stores retrieved successfully.");
      // Sending all store objects as response
      res.json(store);
    })
    .catch((err) => {
      logger.error(`Error retrieving stores: ${err.message}`);
      // If there is an error, sending the error message as response
      res.send(err.message);
    });
};

// Updating basic store info details
const updateStore = async (req, res) => {
  const { storeName, location, storeID } = req.body;

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

    store.storeName = storeName;
    store.location = location;

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
    // Finding the store by the given ID and deleting it from the database
    const data = await Store.findByIdAndDelete(req.params.id);
    logger.info(`Store deleted successfully: ${data}`);
    // Sending the deleted store object as response
    res.json(data);
  } catch (err) {
    logger.error(`Error deleting store: ${err.message}`);
    // If there is an error, sending the error message as response
    res.send(err.message);
  }
};

// Getting a store by ID
const getOneStore = async (req, res) => {
  const id = req.params.id;

  try {
    // Finding the store by the given ID, excluding the image field
    const data = await Store.findById(id).select("-storeItem.image");
    logger.info(`Store retrieved by Name: ${data?.storeName}`);
    res.json(data);
  } catch (err) {
    logger.error(`Error retrieving store by ID: ${err.message}`);
    // If there is an error, sending the error message as response
    res.send(err.message);
  }
};

// Getting the description of a store by ID
const getStoreDescription = async (req, res) => {
  try {
    // Finding the store by the given ID and selecting the 'description' field
    const data = await Store.findById(req.params.id, { description });
    logger.info(`Store description retrieved successfully: ${data}`);
    // Sending the store's description as response
    res.json(data);
  } catch (err) {
    logger.error(`Error retrieving store description: ${err.message}`);
    // If there is an error, sending the error message as response
    res.send(err.message);
  }
};

// Get the item count from the store
const getStoreItemCount = async (req, res) => {
  const storeID = req.params.id;

  try {
    // Find the store with the specified ID, excluding the itemImage field
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

    store.storeItem[itemIndex] = {
      ...store.storeItem[itemIndex].toObject(),
      ...item,
    };
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

    store.reviews.push({ userID, userName, rating, review });
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
  getStoreItemCount,
  addStoreItem,
  deleteStoreItem,
  modifyStoreItem,
};
