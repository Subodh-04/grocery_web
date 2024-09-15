const User = require("../models/userModel");
const Order = require("../models/orderModel");
const sendEmail = require("../services/email_service");
const { sellerApprovalEmailContent } = require("../templates/email_template");
const Product = require("../models/productModel");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ verified: false });
    const formattedUsers = users.map((user) => ({
      id: user._id,
      userName: user.userName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isAdmin: user.isAdmin,
      verified: user.verified,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    res.status(200).json({ users: formattedUsers });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const verifySeller = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role !== "seller") {
      return res.status(400).json({ error: "User is not a seller" });
    }
    user.verified = true;
    await user.save();

    await sendEmail(
      user.email,
      "Account Verified - FreshFinds",
      sellerApprovalEmailContent(user)
    );
    res.status(200).json({ message: "Seller verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSalesReports = async (req, res) => {
  try {
    // Fetch the total count of products and customers
    const productsCount = await Product.countDocuments({});
    const customersCount = await User.countDocuments({ role: "customer" });

    // Fetch all orders for sales data
    const orders = await Order.find({});

    // Variable to store total sales in money across the website
    let totalSalesAmount = 0;

    // Process orders to aggregate sales data (for charting)
    const salesData = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();

      if (!acc[date]) {
        acc[date] = { totalSales: 0, totalDeliveryCost: 0, orderCount: 0 };
      }

      // Update the sales data for the specific date
      acc[date].totalSales += order.totalAmount;
      acc[date].totalDeliveryCost += order.deliveryCost;
      acc[date].orderCount += 1;

      // Accumulate the total sales amount for the entire website
      totalSalesAmount += order.totalAmount;

      return acc;
    }, {});

    // Convert salesData object to an array for charting
    const salesArray = Object.keys(salesData).map((date) => ({
      name: date,
      totalSales: salesData[date].totalSales,
      totalDeliveryCost: salesData[date].totalDeliveryCost,
      orderCount: salesData[date].orderCount,
    }));

    // Return the aggregated data, including total sales in money
    res.json({
      data: {
        productsCount,
        customersCount,
        salesArray,
        totalSalesAmount,  // Include the total sales in money for the whole website
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

module.exports = { getUsers, verifySeller, getSalesReports };
