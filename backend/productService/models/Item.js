const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const logger = require("../logger.js"); // Import the logger

const itemsSchema = new Schema({
  itemName: {
    type: String,
    required: [true, "Item name is required"],
    minlength: [2, "Item name must be at least 3 characters long"],
    maxlength: [100, "Item name cannot exceed 100 characters"],
    trim: true, // Trims whitespace from the input
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    minlength: [2, "Description must be at least 10 characters long"],
    maxlength: [500, "Description cannot exceed 500 characters"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "Image is required"],
  },
  storeID: {
    type: mongoose.Schema.Types.ObjectId, // StoreID should ideally be an ObjectId referring to the Store model
    required: [true, "Store ID is required"],
  },
  storeName: {
    type: String,
    required: [true, "Store name is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be a positive number"],
  },
  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
    min: [0, "Total price must be a positive number"],
    validate: {
      validator: function (v) {
        return v <= this.price; // Total price should not be less than the price
      },
      message: "Total price cannot be more than the item price",
    },
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  discount: {
    type: Number,
    required: [true, "Discount is required"],
    min: [0, "Discount must be a positive number"],
    max: [100, "Discount cannot exceed 100%"],
  },
  reviews: {
    type: Array,
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every(
          (review) =>
            typeof review === "object" &&
            review.rating >= 0 &&
            review.rating <= 5
        ); // Check that all reviews have ratings between 0 and 5
      },
      message: "All reviews must have a rating between 0 and 5",
    },
  },
});

// Pre-save hook to log before saving an item
itemsSchema.pre("save", function (next) {
  logger.info("Attempting to save item", {
    itemName: this.itemName,
    storeID: this.storeID,
  });
  next();
});

// Post-save hook to log after saving an item
itemsSchema.post("save", function (doc) {
  logger.info("Item saved successfully", {
    itemID: doc._id,
    storeID: doc.storeID,
  });
});

// Post-save hook to log errors during save
itemsSchema.post("save", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while saving item", { error: error.message });
  }
  next();
});

// Pre-update hook to log before updating an item
itemsSchema.pre("findOneAndUpdate", function (next) {
  logger.info("Attempting to update item", { update: this.getUpdate() });
  next();
});

// Post-update hook to log after updating an item
itemsSchema.post("findOneAndUpdate", function (doc) {
  if (doc) {
    logger.info("Item updated successfully", { itemID: doc._id });
  }
});

// Post-update hook to log errors during update
itemsSchema.post("findOneAndUpdate", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while updating item", {
      error: error.message,
    });
  }
  next();
});

// Pre-delete hook to log before deleting an item
itemsSchema.pre("findByIdAndDelete", function (next) {
  logger.info("Attempting to delete item", { itemID: this.getQuery()._id });
  next();
});

// Post-delete hook to log after deleting an item
itemsSchema.post("findByIdAndDelete", function (doc) {
  if (doc) {
    logger.info("Item deleted successfully", { itemID: doc._id });
  }
});

// Post-delete hook to log errors during deletion
itemsSchema.post("findByIdAndDelete", function (error, doc, next) {
  if (error) {
    logger.error("Error occurred while deleting item", {
      error: error.message,
    });
  }
  next();
});

module.exports = mongoose.model("Items", itemsSchema);
