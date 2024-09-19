const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Store = require("../models/storeModel");

const checkInventory = async (req, res) => {
  try {
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

    // Fetch orders where the logged-in seller is the seller of the products
    const orders = await Order.find({ "products.seller": req.user._id })
      .populate({
        path: "products.product",
        select: "name prod_img type description price seller",
        populate: {
          path: "store",
          model: "Store",
          select: "storeName storeLocation",
        },
      })
      .populate({
        path: "customer",
        select: "userName email phone address",
      });

    // Aggregate order statistics
    const TotalOrders = await Order.countDocuments({
      "products.seller": req.user._id,
    });
    const Completedorders = await Order.countDocuments({
      "products.seller": req.user._id,
      "products.status": "completed",
    });
    const Pendingorders = await Order.countDocuments({
      "products.seller": req.user._id,
      "products.status": "pending",
    });

    // Format the ordered products
    const orderedProducts = orders.map((order) => {
      // Filter products to include only those from the logged-in seller
      const filteredProducts = order.products.filter(
        (product) => product.seller.toString() === req.user._id.toString()
      );

      return {
        orderId: order._id,
        products: filteredProducts.map((product) => ({
          productId: product.product._id,
          productName: product.product.name,
          productImage: product.product.prod_img,
          type: product.product.type,
          description: product.product.description,
          productPrice: product.product.price,
          sellerId: product.product.seller,
          store: {
            storeId: product.product.store ? product.product.store._id : null,
            storeName: product.product.store
              ? product.product.store.storeName
              : null,
            storeLocation: product.product.store
              ? product.product.store.storeLocation
              : null,
          },
          quantity: product.quantity,
          status: product.status,
        })),
        buyer: order.customer
          ? {
              customerId: order.customer._id,
              customerName: order.customer.userName,
              email: order.customer.email,
              phone: order.customer.phone,
              address: order.customer.address,
            }
          : null,
        totalAmount: order.totalAmount,
        orderDate: formatDate(order.createdAt),
      };
    });

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
      name: { $regex: new RegExp(productname, "i") }, // Case-insensitive and partial match
    });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({
      message: "Products found",
      data: products,
    });
  } catch (error) {
    console.error("Error during product search:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateProductStatus = async (req, res) => {
  const { orderId, productId, newStatus } = req.body;
  const sellerId = req.user.id; // Assuming the sellerId is retrieved from the JWT token

  try {
    // Find the order by orderId and make sure the seller matches
    const order = await Order.findOne({
      _id: orderId,
      "products.product": productId, // Use the 'product' field from your data structure
      "products.seller": sellerId, // Ensure the seller matches the sellerId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order or product not found or not authorized",
      });
    }

    // Find the specific product within the order's products array
    const productIndex = order.products.findIndex(
      (p) => p.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in the order",
      });
    }

    // Update the status of the product within the array
    order.products[productIndex].status = newStatus;
    await updateOrderStatus(orderId);
    // Save the updated order with the new status
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateOrderStatus = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('products.product');
    if (!order) throw new Error("Order not found");

    const allProductsDelivered = order.products.every(
      (product) => product.status === "completed"
    );
    const anyProductDelivering = order.products.some(
      (product) => product.status === "delivering"
    );

    if (allProductsDelivered) {
      order.orderStatus = "completed";
      order.paymentStatus="paid";
    } else if (anyProductDelivering) {
      order.orderStatus = "delivering";
    } else {
      order.orderStatus = "pending";
    }

    await order.save();
    return order;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};


module.exports = {
  checkInventory,
  getOrderSummary,
  removefromcart,
  searchProducts,
  updateProductStatus,
};
