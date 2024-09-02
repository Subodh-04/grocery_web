const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
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
    deliverySlots: [
      {
        label: {
          type: String,
          required: true,
        },
        cost: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ["Paid", "Free"],
          required: true,
        },
      },
    ],
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
