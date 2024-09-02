const User = require("../models/userModel");
const Order = require("../models/orderModel");
const sendEmail = require("../services/email_service");
const { sellerApprovalEmailContent } = require("../templates/email_template");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
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
    const orders = await Order.aggregate([
      {
        $addFields: {
          productsSize: {
            $cond: {
              if: { $isArray: "$product" },
              then: { $size: "$product" },
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$seller",
          totalSales: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          productsSold: { $sum: "$productsSize" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $project: {
          sellerId: "$_id",
          userName: "$seller.userName",
          email: "$seller.email",
          totalSales: 1,
          totalOrders: 1,
          productsSold: 1,
        },
      },
    ]);

    // Debugging
    console.log("Aggregated Orders: ", JSON.stringify(orders, null, 2));

    res.status(200).json({ reports: orders });
  } catch (error) {
    console.error("Error generating sales reports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getUsers, verifySeller, getSalesReports };
