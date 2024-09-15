const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const sendEmail = require("../services/email_service");
const { generateBill } = require("../services/bill_service");
const {
  orderEmailContent,
  orderStatusUpdateEmailContent,
  cancelOrderEmailContent,
} = require("../templates/email_template");

// Add new order
const addOrder = async (req, res) => {
  const { productId, quantity, deliveryOption } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough product in stock" });
    }

    const { label, price, tag } = deliveryOption;

    const productPrice = product.price * quantity;
    const totalAmount = productPrice + price;

    const order = await Order.create({
      product: productId,
      quantity,
      customer: req.user._id,
      seller: product.seller,
      productPrice: productPrice,
      deliveryCost: price,
      totalAmount: totalAmount,
      deliveryTime: {
        label,
        price,
        tag,
      },
    });

    product.quantity -= quantity;
    await product.save();

    await sendEmail(
      req.user.email,
      "Order Placed - FreshFinds",
      orderEmailContent(
        req.user,
        order,
        product,
        quantity,
        productPrice,
        price,
        totalAmount
      )
    );

    const bill = await generateBill(order._id, price);

    res.status(201).json({ success: true, data: order, bill: bill });
  } catch (error) {
    console.error(error);
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
    console.log("Error while cancelling order:", error);
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
    console.log("Internal server error", error);
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
      orderStatusUpdateEmailContent(
        updatedOrder.customer,
        updatedOrder,
        status
      )
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
