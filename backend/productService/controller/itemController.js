const itemModel = require("../models/Item");
const logger = require("../logger"); // Import the logger

// Get all items
const getAllItems = async (req, res) => {
  try {
    const data = await itemModel.find();
    logger.info("Fetched all items");
    res.json(data);
  } catch (err) {
    logger.error("Error fetching items", { error: err.message });
    res.status(500).send(err.message);
  }
};

// Add a new item
const postItem = async (req, res) => {
  const {
    itemName,
    image,
    storeName,
    description,
    price,
    quantity,
    discount,
    storeID,
  } = req.body;

  const totalPrice = price - (price * discount) / 100;

  try {
    const ItemModel = new itemModel({
      itemName,
      description,
      image,
      price,
      quantity,
      discount,
      totalPrice,
      storeName,
      storeID,
    });

    const data = await ItemModel.save();
    logger.info("Item added successfully", { itemName, storeID });
    res.json(data);
  } catch (err) {
    console.log(err);
    // logger.error("Error adding item", { error: err.message });
    res.status(500).json(err.message);
  }
};

// Get one item by ID
const getOneItem = async (req, res) => {
  const { itemID } = req.body;

  try {
    const fetchedItem = await itemModel.findOne({ _id: itemID });
    logger.info("Fetched item", { itemID });
    res.json(fetchedItem);
  } catch (err) {
    logger.error("Error fetching item", { error: err.message, itemID });
    res.status(500).json(err.message);
  }
};

// Update an item
const updateItem = async (req, res) => {
  const itemInfo = req.body;

  try {
    let updatedInfo;

    if (itemInfo.redQuantity) {
      const { quantity } = await itemModel.findById(
        itemInfo.itemID,
        "quantity"
      );

      if (quantity < itemInfo.redQuantity) {
        throw new Error("Not enough stock available");
      }

      updatedInfo = await itemModel.findByIdAndUpdate(
        itemInfo.itemID,
        { $inc: { quantity: -itemInfo.redQuantity } },
        { new: true }
      );
      logger.info("Reduced item quantity", {
        itemID: itemInfo.itemID,
        reducedBy: itemInfo.redQuantity,
      });
    } else {
      itemInfo.totalPrice =
        itemInfo.price - (itemInfo.price * itemInfo.discount) / 100;

      updatedInfo = await itemModel.findByIdAndUpdate(
        itemInfo.itemID,
        itemInfo,
        { new: true }
      );
      logger.info("Updated item", { itemID: itemInfo.itemID });
    }

    res.json(updatedInfo);
  } catch (err) {
    logger.error("Error updating item", {
      error: err.message,
      itemID: itemInfo.itemID,
    });
    res.status(500).json(err.message);
  }
};

// Delete an item by ID
const deleteItem = async (req, res) => {
  const id = req.params.id;

  try {
    const deletedRecord = await itemModel.findByIdAndDelete(id);
    logger.info("Deleted item", { itemID: id });
    res.json(deletedRecord);
  } catch (err) {
    logger.error("Error deleting item", { error: err.message, itemID: id });
    res.status(500).json(err.message);
  }
};

// Add a review for an item
const addReview = async (req, res) => {
  const { review, itemID, userID, userName, rating } = req.body;

  try {
    const insertReview = async (callback) => {
      const item = await itemModel.findOne({ _id: itemID });
      if (item) await callback(item.reviews);
    };

    await insertReview(callBack);

    async function callBack(descArr) {
      descArr.push({ userID, userName, rating, review });
      const data = await itemModel.findOneAndUpdate(
        { _id: itemID },
        { reviews: descArr }
      );
      logger.info("Added review", { itemID, userID, userName });
      res.json(data);
    }
  } catch (err) {
    logger.error("Error adding review", { error: err.message, itemID, userID });
    res.status(500).json(err.message);
  }
};

// Update a review for an item
const modifyReview = async (req, res) => {
  const { review, itemID, userID, userName, rating } = req.body;

  try {
    const removeReview = async (callback) => {
      const item = await itemModel.findOne({ _id: itemID });
      if (item) await callBack(item.reviews);
    };

    removeReview();
  } catch (err) {
    logger.error("Error modifying review", {
      error: err.message,
      itemID,
      userID,
    });
    res.status(500).json(err.message);
  }

  async function callBack(descArr) {
    descArr = descArr.filter((obj) => obj.userID != userID);
    descArr.push({ userID, userName, rating, review });
    const data = await itemModel.findOneAndUpdate(
      { _id: itemID },
      { reviews: descArr }
    );
    logger.info("Modified review", { itemID, userID, userName });
    res.json({ updatedInfo: data });
  }
};

// Delete a review for an item
const deleteReview = (req, res) => {
  const { itemID, userID } = req.body;

  try {
    const removeReview = async (callback) => {
      const item = await itemModel.findOne({ _id: itemID });
      if (item) await callBack(item.reviews);
    };

    removeReview();
  } catch (err) {
    logger.error("Error deleting review", {
      error: err.message,
      itemID,
      userID,
    });
    res.status(500).json(err.message);
  }

  async function callBack(descArr) {
    descArr = descArr.filter((obj) => obj.userID != userID);
    const data = await itemModel.findOneAndUpdate(
      { _id: itemID },
      { reviews: descArr }
    );
    logger.info("Deleted review", { itemID, userID });
    res.json({ updatedInfo: data });
  }
};

// Delete all store items
const deleteAllItemsFromStore = async (req, res) => {
  try {
    const data = await itemModel.deleteMany({ storeID: req.params.id });
    logger.info("Deleted all items from store", { storeID: req.params.id });
    res.json(data);
  } catch (err) {
    logger.error("Error deleting all items from store", {
      error: err.message,
      storeID: req.params.id,
    });
    res.status(500).send(err.message);
  }
};

// Get all items with pagination
const getAllItemsWithPagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const data = await itemModel.find().skip(skip).limit(limit);
    const totalItems = await itemModel.countDocuments();

    logger.info("Fetched items with pagination", { page, limit });
    res.json({
      items: data,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (err) {
    logger.error("Error fetching items with pagination", {
      error: err.message,
      page,
      limit,
    });
    res.status(500).send(err.message);
  }
};

module.exports = {
  postItem,
  addReview,
  getAllItems,
  getOneItem,
  deleteItem,
  modifyReview,
  deleteReview,
  updateItem,
  deleteAllItemsFromStore,
  getAllItemsWithPagination,
};
