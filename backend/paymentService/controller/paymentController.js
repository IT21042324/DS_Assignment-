const Payment = require("../models/Payment");
const mongoose = require("mongoose");

// This function creates a new payment and saves it to the database
const createPayment = async (req, res) => {
  const { amount, itemList, userID } = req.body;

  const newPayment = new Payment({
    amount,
    itemList,
    userID,
  });

  try {
    const data = await newPayment.save();
    res.status(201).json(data); // 201 status code for successful creation
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message }); // Return validation errors
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// This function retrieves all payments from the database
const getAllPayment = async (req, res) => {
  try {
    const payments = await Payment.find().populate("itemList"); // Populate item details
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// This function updates a payment's status
const updatePayment = async (req, res) => {
  const { paymentID, status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(paymentID)) {
    return res.status(400).json({ error: "Invalid payment ID" });
  }

  try {
    const payment = await Payment.findById(paymentID);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.status = status;
    await payment.save();

    res.status(200).json(payment);
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// This function deletes a payment from the database
const deletePayment = async (req, res) => {
  const { paymentID } = req.body;

  if (!mongoose.Types.ObjectId.isValid(paymentID)) {
    return res.status(400).json({ error: "Invalid payment ID" });
  }

  try {
    const deletedPayment = await Payment.findByIdAndDelete(paymentID);

    if (!deletedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json({ status: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// This function calculates the total payment amount for a particular store and the number of orders
const getTotalPaymentPerStore = async (req, res) => {
  const storeID = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(storeID)) {
    return res.status(400).json({ error: "Invalid store ID" });
  }

  try {
    const results = await Payment.aggregate([
      { $unwind: "$itemList" }, // Unwind the itemList array
      { $match: { "itemList.storeID": storeID } }, // Match only items from the provided store
      {
        $group: {
          _id: "$_id", // Group by the payment record (_id) to calculate total per order
          orderTotal: {
            $sum: {
              $multiply: ["$itemList.itemPrice", "$itemList.itemQuantity"], // Calculate total for each order
            },
          },
        },
      },
      {
        $group: {
          _id: null, // Group everything into a single result
          totalAmount: { $sum: "$orderTotal" }, // Sum all the order totals
          orderCount: { $sum: 1 }, // Count the number of unique orders
        },
      },
    ]);

    if (!results || results.length === 0) {
      return res.status(404).json({ total: 0, orderCount: 0 });
    }

    const { totalAmount, orderCount } = results[0];
    res.status(200).json({ total: totalAmount, orderCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// This function retrieves total payments for admin
const getTotalPaymentForAdmin = async (req, res) => {
  try {
    const result = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          amountForStore: { $multiply: ["$totalAmount", 0.15] },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ error: "No payment data available for admin" });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Exporting the functions to be used in other modules
module.exports = {
  createPayment,
  getAllPayment,
  updatePayment,
  deletePayment,
  getTotalPaymentPerStore,
  getTotalPaymentForAdmin,
};
