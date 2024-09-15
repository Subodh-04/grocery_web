const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Store = require("../models/storeModel");

const checkInventory = async (req, res) => {
  try {
    console.log(req.user._id);
    
    const products = await Product.find({ seller: req.user._id });
    const totalproducts = await Product.countDocuments({
      seller: req.user._id,
    });
    res
      .status(200)
      .json({ success: true, totalProducts: totalproducts, data: products });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to check inventory" });
  }
};

const getOrderSummary = async (req, res) => {
  try {
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const orders = await Order.find({ seller: req.user._id })
      .populate({
        path: "product",
        populate: {
          path: "store",
          model: "Store",
        },
      })
      .populate("customer");

    const TotalOrders = await Order.countDocuments({ seller: req.user._id });
    const Completedorders = await Order.countDocuments({
      seller: req.user._id,
      status: "completed",
    });
    const Pendingorders = await Order.countDocuments({
      seller: req.user._id,
      status: "pending",
    });

    const orderedProducts = orders.map((order) => ({
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
          storeId: order.product.store ? order.product.store._id : null,
          storeName: order.product.store ? order.product.store.storeName : null,
          storeLocation: order.product.store
            ? order.product.store.storeLocation
            : null,
        },
      },
      buyer: order.customer
        ? {
            customerId: order.customer._id,
            customerName: order.customer.userName,
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.customer.address,
          }
        : null,
      status: order.status,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      orderDate: formatDate(order.createdAt),
    }));

    res.status(200).json({
      success: true,
      total: TotalOrders,
      completed: Completedorders,
      pending: Pendingorders,
      data: orderedProducts,
    });
  } catch (error) {
    console.error("Error fetching order summary:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get order summary" });
  }
};

const removefromcart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const user = await User.findById(userId);

    user.cart = user.cart.filter(
      (item) => item._id.toString() !== productId.toString()
    );
    await user.save();
    res
      .status(200)
      .send({ message: "Product removed from the cart Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
};

const searchProducts = async (req, res) => {
    try {
      const { productname } = req.query; // Read search term from query parameters
  
      if (!productname) {
        return res.status(400).json({ message: "Search term is required" });
      }
  
      // Use regular expression for partial, case-insensitive matches
      const products = await Product.find({
        name: { $regex: new RegExp(productname, "i") } // Case-insensitive and partial match
      });
  
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
  
      res.status(200).json({
        message: "Products found",
        data: products
      });
    } catch (error) {
      console.error("Error during product search:", error);
      return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
  checkInventory,
  getOrderSummary,
  removefromcart,
  searchProducts,
};
