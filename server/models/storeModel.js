const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
    },
    storeImage: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR91ItaG-Xgg2G2LlvJT3j2U_Q-AuNfCDY-kA&s",
    },
    storeLocation: {
      type: String,
      required: true,
    },
    deliveryOptions: {
      type: String,
      required: true,
    },
    proximity: {
      type: String,
    },
    categories: {
      type: [String],
    },
    pickupAvailable: {
      type: Boolean,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;
