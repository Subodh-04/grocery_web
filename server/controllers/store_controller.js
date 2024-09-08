const Product = require("../models/productModel");
const Store = require("../models/storeModel");
const User = require("../models/userModel");

const createStore = async (req, res) => {
  try {
    const {
      storeName,
      storeLocation,
      deliveryOptions,
      proximity,
      categories,
      deliverySlots,
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
      deliverySlots,
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
      return res.status(404).send({ message: "Store Doesnt Exist" });
    }
    res.status(200).send({
      success: true,
      message: "Store Details Updated Successfully",
      data: store,
    });
  } catch (error) {
    console.log("Error Updating Store:", error);
    res.status(400).send({ message: "Internal Server Error" });
  }
};

const getStores = async (req, res) => {
  try {
    const Stores = await Store.find({}).select(
      "storeName storeImage storeLocation proximity deliveryOptions categories seller"
    );
    const storeCount = await Store.countDocuments();
    res.status(200).send({ TotalStores: storeCount, Stores });
  } catch (error) {
    console.log("Error Getting Stores", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId).populate("product");
    if (!store) {
      return res.status(404).send({ message: "Store Doesnt Exists" });
    }

    const products=await Product.find({store:storeId,seller:store.seller});
    const totalProducts=await Product.countDocuments({store:storeId,seller:store.seller});

    res.status(200).send({ data: store,totalProducts:totalProducts,products });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log("Error while Finding Store:", error);
  }
};

module.exports = { createStore, getStores, updateStoreDetails, findStoreById };
