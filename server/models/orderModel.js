const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        productPrice: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "delivering", "completed"],
          default: "pending",
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryCost: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentType: {
      type: String,
      enum: ["COD", "Stripe"],
      required: true,
    },
    paymentId: {
      type: String,
      required: function () {
        return this.paymentType == "Stripe";
      },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "delivering", "completed", "cancelled"],
      default: "pending",
    },
    deliveryTime: {
      label: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      tag: {
        type: String,
        enum: ["Paid", "Free"],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
