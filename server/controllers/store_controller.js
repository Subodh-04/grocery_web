const { default: mongoose } = require("mongoose");
const Product = require("../models/productModel");
const Store = require("../models/storeModel");
const User = require("../models/userModel");
const { checkInventory } = require("./product_controller");

const createStore = async (req, res) => {
  try {
    const {
      storeName,
      storeLocation,
      deliveryOptions,
      proximity,
      categories,
      pickupAvailable,
    } = req.body;
    const sellerId = req.user._id;

    const user = await User.findById(sellerId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "seller") {
      return res
        .status(400)
        .json({ message: "Only sellers can create a store" });
    }
    if (!user.verified) {
      return res
        .status(403)
        .json({ message: "Seller account not verified by admin" });
    }

    const storeExists = await Store.findOne({ storeName });
    if (storeExists) {
      return res
        .status(400)
        .json({ message: "Store with this name already exists" });
    }

    const newStore = await Store.create({
      storeName,
      storeLocation,
      deliveryOptions,
      proximity,
      categories,
      pickupAvailable,
      seller: sellerId,
    });

    await User.findByIdAndUpdate(sellerId, { store: newStore._id });

    res
      .status(201)
      .json({ message: "Store created successfully", store: newStore });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateStoreDetails = async (req, res) => {
  try {
    const { storeId } = req.params;
    const updatedData = req.body;

    const store = await Store.findByIdAndUpdate(storeId, updatedData, {
      new: true,
    });
    if (!store) {
      return res.status(404).send({ message: "Store doesn't exist" });
    }
    res.status(200).send({
      success: true,
      message: "Store details updated successfully",
      data: store,
    });
  } catch (error) {
    console.log("Error updating store:", error);
    res.status(400).send({ message: "Internal server error" });
  }
};

const getStores = async (req, res) => {
  try {
    const stores = await Store.find({}).select(
      "storeName storeImage storeLocation proximity deliveryOptions categories seller"
    );
    const storeCount = await Store.countDocuments();
    res.status(200).send({ TotalStores: storeCount, Stores: stores });
  } catch (error) {
    console.log("Error getting stores", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;
    console.log("Received storeId:", storeId); // Log the storeId

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ message: "Invalid store ID format" });
    }

    const store = await Store.findById(storeId).select(
      "storeName storeImage storeLocation deliveryOptions proximity categories pickupAvailable seller"
    );
    if (!store) {
      return res.status(404).send({ message: "Store doesn't exist" });
    }

    const products = await Product.find({ store: storeId });
    const totalProducts = await Product.countDocuments({ store: storeId });

    res.status(200).send({
      data: store,
      totalProducts,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log("Error while finding store:", error);
  }
};

module.exports = { createStore, getStores, updateStoreDetails, findStoreById };
