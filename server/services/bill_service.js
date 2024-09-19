const Order = require("../models/orderModel");
const sendEmail = require("../services/email_service");
const { billEmailContent } = require("../templates/email_template");

const generateBill = async (orderId, deliveryCost) => {
  try {
    // Find the order by ID and populate the necessary fields
    const order = await Order.findById(orderId)
      .populate("products.product") // Populate product details within the products array
      .populate("products.seller") // Populate seller details within the products array
      .populate("customer", "-password"); // Exclude password field from customer data

    if (!order) {
      throw new Error("Order not found");
    }

    const customer = order.customer;
    let totalProductCost = 0;
    const productDetails = [];

    // Loop through all products in the order to calculate the cost and prepare the details
    order.products.forEach((item) => {
      const product = item.product;
      const seller = item.seller;

      const productCost = product.price * item.quantity;
      totalProductCost += productCost;

      productDetails.push({
        productId: product._id,
        productName: product.name,
        productQuantity: item.quantity,
        productCost: productCost,
        sellerName: seller.userName,
      });
    });

    // Calculate the total amount (sum of product costs + delivery cost)
    const totalAmount = totalProductCost + deliveryCost;

    // Prepare the bill object
    const bill = {
      orderId: order._id,
      customerName: customer.userName,
      customerEmail: customer.email,
      products: productDetails,
      deliveryCost: deliveryCost,
      totalProductCost: totalProductCost,
      totalAmount: totalAmount,
      createdAt: order.createdAt,
    };

    // Send the email with the bill
    await sendEmail(customer.email, "Your Bill - FreshFinds", billEmailContent(customer, bill));

    return bill;
  } catch (error) {
    console.error("Error generating bill:", error);
    throw new Error("Failed to generate bill.");
  }
};

module.exports = { generateBill };
