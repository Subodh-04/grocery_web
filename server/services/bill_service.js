const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const sendEmail = require("../services/email_service");
const { billEmailContent } = require("../templates/email_template");

const generateBill = async (orderId,deliveryCost) => {
  try {
    const order = await Order.findById(orderId)
      .populate("product")
      .populate("customer")
      .populate("seller");

    if (!order) {
      throw new Error("Order not found");
    }

    const customer = order.customer;
    const product = order.product;
    const seller = order.seller;

    const productCost = product.price * order.quantity;
    const totalAmount = productCost + deliveryCost;

    const bill = {
      orderId: order._id,
      customerName: customer.userName,
      customerEmail: customer.email,
      productName: product.name,
      productQuantity: order.quantity,
      productCost: productCost,
      deliveryCost: deliveryCost,
      totalAmount: totalAmount,
      sellerName: seller.userName,
      createdAt: order.createdAt,
    };

    await sendEmail(customer.email, "Your Bill - FreshFinds", billEmailContent(customer,bill));
    return bill;
  } catch (error) {
    console.error("Error generating bill:", error);
    throw new Error("Failed to generate bill.");
  }
};

module.exports = { generateBill };
