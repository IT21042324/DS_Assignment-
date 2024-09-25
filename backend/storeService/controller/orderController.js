let Order = require("../models/Order");
let logger = require("../logger.js");
let validator = require("validator");

// Create a new order
const createOrder = async (req, res) => {
  const { userID, storeID, paymentID, itemList } = req.body;

  // Sanitize input
  const sanitizedUserID = validator.escape(userID);
  const sanitizedStoreID = validator.escape(storeID);
  const sanitizedPaymentID = validator.escape(paymentID);

  // Ensure itemList contents are also sanitized
  const sanitizedItemList = itemList.map((item) => ({
    itemName: validator.escape(item.itemName),
    itemPrice: item.itemPrice, // assumed its anumber obvi so didnt add sanitization
    itemQuantity: item.itemQuantity, // this tooo
  }));

  logger.info("Creating a new order", {
    sanitizedUserID,
    sanitizedStoreID,
    sanitizedPaymentID,
  });

  const newOrder = new Order({
    userID: sanitizedUserID,
    storeID: sanitizedStoreID,
    paymentID: sanitizedPaymentID,
    itemList: sanitizedItemList,
  });

  try {
    const data = await newOrder.save();
    logger.info("Order created successfully", { orderID: data._id });
    res.json(data);
  } catch (err) {
    logger.error("Error creating order", { error: err.message });
    res.json(err.message);
  }
};

// Get all orders
const getAllOrder = async (req, res) => {
  logger.info("Fetching all orders");

  try {
    const data = await Order.find();
    logger.info("All orders retrieved successfully", { count: data.length });
    res.json(data);
  } catch (err) {
    logger.error("Error fetching all orders", { error: err.message });
    res.send(err.message);
  }
};

// Update an order
const updateOrder = async (req, res) => {
  const { orderID, status } = req.body;

  // Sanitize inputs
  const sanitizedOrderID = validator.escape(orderID);
  const sanitizedStatus = validator.escape(status);

  logger.info("Updating order", {
    orderID: sanitizedOrderID,
    status: sanitizedStatus,
  });

  try {
    const updateStore = { status: sanitizedStatus };
    const update = await Order.findByIdAndUpdate(
      sanitizedOrderID,
      updateStore,
      {
        new: true,
      }
    );
    logger.info("Order updated successfully", { orderID: sanitizedOrderID });
    res.status(200).send({ Status: "Order updated", order: update });
  } catch (err) {
    logger.error("Error updating order", {
      orderID: sanitizedOrderID,
      error: err.message,
    });
    res.status(500).send({ status: "Error with updating data" });
  }
};

// Get a single order by ID
const getOneOrder = async (req, res) => {
  const sanitizedOrderID = validator.escape(req.params.id); // Sanitize the order ID from URL parameters
  logger.info("Fetching order by ID", { orderID: sanitizedOrderID });

  try {
    const order = await Order.findById(sanitizedOrderID);
    logger.info("Order retrieved successfully", { orderID: sanitizedOrderID });
    res.status(200).send(order);
  } catch (err) {
    logger.error("Error fetching order", {
      orderID: sanitizedOrderID,
      error: err.message,
    });
    res
      .status(500)
      .send({ status: "Error Fetching Order", error: err.message });
  }
};

// Get all orders for a specific store
const getAllOrderPerStore = async (req, res) => {
  const sanitizedStoreID = validator.escape(req.params.id); // Sanitize store ID
  logger.info("Fetching all orders for store", { storeID: sanitizedStoreID });

  try {
    const orders = await Order.find({ storeID: sanitizedStoreID }).select(
      "-itemList.itemImage"
    );

    const result = orders.map((order) => ({
      ...order.toObject(),
      totalAmount: order.itemList.reduce(
        (total, item) => total + item.itemPrice * item.itemQuantity,
        0
      ),
    }));

    logger.info("Orders retrieved successfully for store", {
      storeID: sanitizedStoreID,
    });
    res.json(result);
  } catch (error) {
    logger.error("Error fetching orders for store", {
      storeID: sanitizedStoreID,
      error: error.message,
    });
    res.status(500).json({ error: "Failed to get orders for store" });
  }
};

// Update the order status
const updateOrderStatus = async (req, res) => {
  const { orderID, status } = req.body;

  const sanitizedOrderID = validator.escape(orderID);
  const sanitizedStatus = validator.escape(status);

  logger.info("Updating order status", {
    orderID: sanitizedOrderID,
    status: sanitizedStatus,
  });

  try {
    const data = await Order.findByIdAndUpdate(
      sanitizedOrderID,
      { status: sanitizedStatus },
      { new: true }
    );
    logger.info("Order status updated successfully", {
      orderID: sanitizedOrderID,
    });
    res.json(data);
  } catch (err) {
    logger.error("Error updating order status", {
      orderID: sanitizedOrderID,
      error: err.message,
    });
    res.send(err.message);
  }
};

// Get the count of all orders for the admin dashboard
const getOrderCountForAdmin = async (req, res) => {
  logger.info("Fetching order count for admin");

  try {
    const orderCount = await Order.countDocuments();
    logger.info("Order count retrieved successfully", { count: orderCount });
    res.json({ orderCount });
  } catch (err) {
    logger.error("Error fetching order count for admin", {
      error: err.message,
    });
    res.send(err.message);
  }
};

// Get all orders for all stores
const getAllStoreOrders = async (req, res) => {
  logger.info("Fetching all orders for all stores");

  try {
    const data = await Order.find().select("-itemList.itemImage");
    logger.info("All store orders retrieved successfully", {
      count: data.length,
    });
    res.json(data);
  } catch (err) {
    logger.error("Error fetching all store orders", { error: err.message });
    res.send(err.message);
  }
};

// Get all orders for a particular user
const getAllUserOrders = async (req, res) => {
  const sanitizedUserID = validator.escape(req.params.id); // Sanitize the user ID from URL parameters
  logger.info("Fetching all orders for user", { userID: sanitizedUserID });

  try {
    const data = await Order.find({ userID: sanitizedUserID });
    logger.info("Orders retrieved successfully for user", {
      userID: sanitizedUserID,
      count: data.length,
    });
    res.json(data);
  } catch (err) {
    logger.error("Error fetching user orders", {
      userID: sanitizedUserID,
      error: err.message,
    });
    res.send(err.message);
  }
};

// Set the reviewed status of an order
const setReviewStatus = async (req, res) => {
  const sanitizedOrderID = validator.escape(req.params.id); // Sanitize the order ID from URL parameters
  logger.info("Setting review status for order", { orderID: sanitizedOrderID });

  try {
    const data = await Order.findByIdAndUpdate(sanitizedOrderID, {
      reviewed: true,
    });
    logger.info("Review status set successfully for order", {
      orderID: sanitizedOrderID,
    });
    res.json(data);
  } catch (err) {
    logger.error("Error setting review status for order", {
      orderID: sanitizedOrderID,
      error: err.message,
    });
    res.send(err.message);
  }
};

module.exports = {
  createOrder,
  getAllOrder,
  updateOrder,
  getOneOrder,
  getAllUserOrders,
  getAllStoreOrders,
  getAllOrderPerStore,
  updateOrderStatus,
  setReviewStatus,
  getOrderCountForAdmin,
};
