const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const sendEmail = require("../services/email_service");
const { generateBill } = require("../services/bill_service");
const {
  orderEmailContent,
  orderStatusUpdateEmailContent,
  cancelOrderEmailContent,
} = require("../templates/email_template");
const User = require("../models/userModel");

const stripe = require("stripe")(
  "sk_test_51PzviN1hYkTOanlJkGJbY3Ssv39dEeAwDJdaMzMtozx7LymhdFvsFmb1J0YGClqmMDBwq6ss8MD4QSw1aLCoEoR300RsoBwqQ7"
);

// Add new order
const addOrder = async (req, res) => {
  try {
    const { items, deliveryOption } = req.body;

    let totalAmount = 0;
    let orderItems = [];

    for (let item of items) {
      const { productId, quantity } = item;

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product ${productId} not found` });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product ${productId}`,
        });
      }

      const productPrice = product.price * quantity;
      totalAmount += productPrice;

      // Add item to order items
      orderItems.push({
        product: productId,
        quantity,
        productPrice,
        seller: product.seller,
      });

      // Update product quantity
      product.quantity -= quantity;
      await product.save();
    }

    const { label, price, tag } = deliveryOption;
    const deliveryCost = price;
    totalAmount += deliveryCost;

    // Create the order
    const order = await Order.create({
      products: orderItems,
      customer: req.user._id,
      deliveryCost,
      totalAmount,
      deliveryTime: {
        label,
        price: deliveryCost,
        tag,
      },
    });

    console.log("New order object:", order);

    // Clear the user's cart
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    // Prepare line items for Stripe
    const line_items = items.map((item) => {
      if (!item.price || isNaN(item.price)) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Ensure price is in correct format
        },
        quantity: item.quantity,
      };
    });

    // Add delivery charges
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCost * 100, // Delivery fee in the smallest currency unit
      },
      quantity: 1,
    });

    // Ensure total amount is above minimum threshold (₹37.00)
    const totalStripeAmount = line_items.reduce(
      (total, item) => total + item.price_data.unit_amount * item.quantity,
      0
    );
    if (totalStripeAmount < 3700) {
      // Minimum amount of ₹37.00
      return res.status(400).json({
        success: false,
        message: "Total amount is too low. Minimum amount is ₹37.00",
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `http://localhost:5000/verify?success=true&orderId=${order._id}`,
      cancel_url: `http://localhost:5000/verify?success=false&orderId=${order._id}`,
    });

    // Respond with the session URL
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add order",
      error: error.message,
    });
  }
};

// Cancel order by customer
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    await sendEmail(
      req.user.email,
      "Order Cancelled - FreshFinds",
      cancelOrderEmailContent(req.user, orderId)
    );

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

// Cancel order by seller
const cancelOrderSeller = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order doesn't exist" });
    }

    await sendEmail(
      order.customer.email,
      "Order Cancelled by Seller - FreshFinds",
      cancelOrderEmailContent(order.customer, orderId)
    );

    res.status(200).json({ message: "Order cancelled by seller successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order by seller" });
  }
};

// Get customer orders
const getOrder = async (req, res) => {
  try {
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();

      return `${month} ${day}, ${year}`;
    };

    const orders = await Order.find({ customer: req.user._id }).populate(
      "product"
    );

    const orderData = orders.map((order) => ({
      orderId: order._id,
      product: {
        productId: order.product._id,
        productName: order.product.name,
        productImage: order.product.prod_img,
        type: order.product.type,
        description: order.product.description,
        productPrice: order.product.price,
        sellerId: order.product.seller,
        store: {
          storeId: order.product.store._id,
          storeName: order.product.store.storeName,
          storeLocation: order.product.store.storeLocation,
        },
      },
      buyer: {
        customerId: order.customer._id,
        customerName: order.customer.userName,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address,
      },
      status: order.status,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      orderDate: formatDate(order.createdAt),
    }));

    res.status(200).json(orderData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get orders for a seller
const getOrdersBySeller = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate("product")
      .exec();

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("customer");

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    await sendEmail(
      updatedOrder.customer.email,
      "Order Status Updated - FreshFinds",
      orderStatusUpdateEmailContent(updatedOrder.customer, updatedOrder, status)
    );

    res.status(200).json({
      message: "Order status updated successfully",
      updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addOrder,
  cancelOrder,
  cancelOrderSeller,
  getOrder,
  getOrdersBySeller,
  updateOrderStatus,
};
