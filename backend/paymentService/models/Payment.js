const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const logger = require("../logger.js"); // Import the logger

const paymentSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  itemList: {
    type: Array,
    default: [],
  },
  userID: { type: String, required: true },
  status: {
    type: String,
    default: "Processing",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Middleware to log before saving a payment
paymentSchema.pre("save", function (next) {
  logger.info("Attempting to save payment", { payment: this });
  next();
});

// Middleware to log after saving a payment
paymentSchema.post("save", function (doc) {
  logger.info("Payment saved successfully", { paymentID: doc._id });
});

// Middleware to log errors during save
paymentSchema.post("save", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while saving payment", {
      error: error.message,
    });
  }
  next();
});

// Middleware to log before updating a payment
paymentSchema.pre("findOneAndUpdate", function (next) {
  logger.info("Attempting to update payment", { update: this.getUpdate() });
  next();
});

// Middleware to log after updating a payment
paymentSchema.post("findOneAndUpdate", function (doc) {
  logger.info("Payment updated successfully", { paymentID: doc._id });
});

// Middleware to log errors during update
paymentSchema.post("findOneAndUpdate", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while updating payment", {
      error: error.message,
    });
  }
  next();
});

// Middleware to log before deleting a payment
paymentSchema.pre("findByIdAndDelete", function (next) {
  logger.info("Attempting to delete payment", {
    paymentID: this.getQuery()._id,
  });
  next();
});

// Middleware to log after deleting a payment
paymentSchema.post("findByIdAndDelete", function (doc) {
  if (doc) {
    logger.info("Payment deleted successfully", { paymentID: doc._id });
  }
});

// Middleware to log errors during delete
paymentSchema.post("findByIdAndDelete", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while deleting payment", {
      error: error.message,
    });
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
